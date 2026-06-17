// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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
    localStorage.clear();
    vi.resetAllMocks();
  });

  it("auto-applies a complete assistant response", async () => {
    const onApplyDraft = vi.fn().mockResolvedValue(undefined);
    const draft = {
      action: "create_body_measurement" as const,
      confidence: "high" as const,
      missingFields: [],
      payload: {
        date: "2026-06-09T08:00:00.000Z",
        weightKg: 82.4,
      },
      reply: "C'est note, j'ajoute ta pesee.",
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

    fireEvent.click(screen.getByRole("button", { name: /chat ia/i }));
    fireEvent.change(screen.getByPlaceholderText(/ajoute ma pesee/i), {
      target: { value: "Ajoute ma pesee du jour a 82,4 kg" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

    await waitFor(() => {
      expect(api.createAssistantDraft).toHaveBeenCalledWith({
        context: "measurements",
        currentDraft: undefined,
        history: [],
        message: "Ajoute ma pesee du jour a 82,4 kg",
      });
    });
    await waitFor(() => {
      expect(onApplyDraft).toHaveBeenCalledWith(draft);
    });
    expect(
      screen.getByText("C'est note, j'ajoute ta pesee."),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("C'est fait. J'ai rafraichi les donnees.").length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("reuses the current conversation when the assistant still needs more info", async () => {
    const onApplyDraft = vi.fn().mockResolvedValue(undefined);
    const firstDraft = {
      action: "create_meal" as const,
      confidence: "medium" as const,
      missingFields: ["quantities"],
      payload: {
        items: [{ foodId: "food-1", name: "Riz", resolvedName: "Riz" }],
        mealType: "lunch",
      },
      reply: "Il me manque encore les quantites.",
      requiresConfirmation: true,
      summary: "Preparer un repas lunch.",
    };
    const secondDraft = {
      ...firstDraft,
      missingFields: [],
      payload: {
        ...firstDraft.payload,
        items: [
          {
            foodId: "food-1",
            name: "Riz",
            quantityGrams: 150,
            resolvedName: "Riz",
          },
        ],
      },
      reply: "C'est bon, je m'en occupe.",
    };
    vi.mocked(api.createAssistantDraft)
      .mockResolvedValueOnce(firstDraft)
      .mockResolvedValueOnce(secondDraft);

    render(
      <AssistantChatbox
        isAuthBypassEnabled={false}
        onApplyDraft={onApplyDraft}
        resource="meals"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /chat ia/i }));
    fireEvent.change(screen.getByPlaceholderText(/ajoute ma pesee/i), {
      target: { value: "Ajoute mon repas avec riz" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

    await screen.findByText("Il me manque encore les quantites.");

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "150g" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

    await waitFor(() => {
      expect(api.createAssistantDraft).toHaveBeenLastCalledWith({
        context: "meals",
        currentDraft: firstDraft,
        history: [
          {
            content: "Ajoute mon repas avec riz",
            role: "user",
          },
          {
            content: "Il me manque encore les quantites.",
            role: "assistant",
          },
        ],
        message: "150g",
      });
    });
    await waitFor(() => {
      expect(onApplyDraft).toHaveBeenCalledWith(secondDraft);
    });
    expect(
      screen.getByText("C'est bon, je m'en occupe."),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("C'est fait. J'ai rafraichi les donnees.").length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("disables the assistant when auth bypass is enabled", () => {
    render(
      <AssistantChatbox
        isAuthBypassEnabled
        onApplyDraft={vi.fn()}
        resource="dashboard"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /chat ia/i }));

    expect(screen.getByText(/mode bypass est actif/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});
