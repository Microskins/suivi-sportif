// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "../../api/client";
import { AssistantChatbox } from "./AssistantChatbox";

expect.extend(matchers);

vi.mock("../../api/client", () => ({
  api: {
    createAssistantDraft: vi.fn(),
  },
}));

describe("AssistantChatbox", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("creates and displays an assistant draft", async () => {
    const onApplyDraft = vi.fn();
    vi.mocked(api.createAssistantDraft).mockResolvedValue({
      action: "create_meal",
      confidence: "high",
      missingFields: ["quantities"],
      payload: {
        items: [{ foodId: "food-1", name: "Riz", resolvedName: "Riz" }],
        mealType: "lunch",
      },
      requiresConfirmation: true,
      summary: "Preparer un repas lunch.",
    });

    render(
      <AssistantChatbox
        isAuthBypassEnabled={false}
        onApplyDraft={onApplyDraft}
        resource="meals"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /assistant/i }));
    fireEvent.change(screen.getByPlaceholderText(/ajoute mon repas/i), {
      target: { value: "Ajoute mon repas de ce midi avec riz" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Preparer le brouillon" }),
    );

    await waitFor(() => {
      expect(api.createAssistantDraft).toHaveBeenCalledWith({
        context: "meals",
        message: "Ajoute mon repas de ce midi avec riz",
      });
    });
    expect(screen.getByText("Preparer un repas lunch.")).toBeInTheDocument();
    expect(screen.getByText(/A completer: quantities/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Complete les champs manquants avant confirmation",
      }),
    ).toBeDisabled();
    expect(onApplyDraft).not.toHaveBeenCalled();
  });

  it("applies a complete assistant draft after confirmation", async () => {
    const onApplyDraft = vi.fn().mockResolvedValue(undefined);
    const draft = {
      action: "create_body_measurement" as const,
      confidence: "high" as const,
      missingFields: [],
      payload: {
        date: "2026-06-09T08:00:00.000Z",
        weightKg: 82.4,
      },
      requiresConfirmation: true,
      summary: "Ajouter une pesee a 82.4 kg.",
    };
    vi.mocked(api.createAssistantDraft).mockResolvedValue(draft);

    render(
      <AssistantChatbox
        isAuthBypassEnabled={false}
        onApplyDraft={onApplyDraft}
        resource="measurements"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /assistant/i }));
    fireEvent.change(screen.getByPlaceholderText(/ajoute mon repas/i), {
      target: { value: "Ajoute ma pesee du jour a 82,4 kg" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Preparer le brouillon" }),
    );

    await screen.findByText("Ajouter une pesee a 82.4 kg.");
    fireEvent.click(
      screen.getByRole("button", { name: "Confirmer et appliquer" }),
    );

    await waitFor(() => {
      expect(onApplyDraft).toHaveBeenCalledWith(draft);
    });
    expect(
      screen.getByText("Action appliquee. Les donnees ont ete rafraichies."),
    ).toBeInTheDocument();
  });

  it("disables the assistant when auth bypass is enabled", () => {
    render(
      <AssistantChatbox
        isAuthBypassEnabled
        onApplyDraft={vi.fn()}
        resource="dashboard"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /assistant/i }));

    expect(screen.getByText(/mode bypass est actif/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});
