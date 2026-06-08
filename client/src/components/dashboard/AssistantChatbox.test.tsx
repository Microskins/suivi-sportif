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

    render(<AssistantChatbox isAuthBypassEnabled={false} resource="meals" />);

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
    expect(screen.getByText(/Confirmation et application/)).toBeInTheDocument();
  });

  it("disables the assistant when auth bypass is enabled", () => {
    render(<AssistantChatbox isAuthBypassEnabled resource="dashboard" />);

    fireEvent.click(screen.getByRole("button", { name: /assistant/i }));

    expect(screen.getByText(/mode bypass est actif/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});
