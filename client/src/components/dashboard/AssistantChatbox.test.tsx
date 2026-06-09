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
    localStorage.clear();
    vi.resetAllMocks();
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
      reply: "J'ai prepare ton repas, il manque juste la quantite.",
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
      screen.getByRole("button", { name: "Envoyer a l'assistant" }),
    );

    await waitFor(() => {
      expect(api.createAssistantDraft).toHaveBeenCalledWith({
        context: "meals",
        currentDraft: undefined,
        history: [],
        message: "Ajoute mon repas de ce midi avec riz",
      });
    });
    expect(screen.getAllByText("Preparer un repas lunch.").length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getAllByText("J'ai prepare ton repas, il manque juste la quantite.")
        .length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText("quantites en grammes ou portions"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Complete les champs manquants avant confirmation",
      }),
    ).toBeDisabled();
    expect(onApplyDraft).not.toHaveBeenCalled();
  });

  it("sends recent chat history with the next assistant request", async () => {
    const onApplyDraft = vi.fn();
    vi.mocked(api.createAssistantDraft)
      .mockResolvedValueOnce({
        action: "create_body_measurement",
        confidence: "high",
        missingFields: [],
        payload: {
          date: "2026-06-09T08:00:00.000Z",
          weightKg: 82.4,
        },
        reply: "C'est note, j'ai prepare la pesee.",
        requiresConfirmation: true,
        summary: "Ajouter une pesee a 82.4 kg.",
      })
      .mockResolvedValueOnce({
        action: "update_body_measurement",
        confidence: "low",
        missingFields: ["id"],
        payload: {
          date: "2026-06-09T08:00:00.000Z",
          weightKg: 82.1,
        },
        reply: "Je prepare la correction de ta pesee.",
        requiresConfirmation: true,
        summary: "Modifier une pesee a 82.1 kg.",
      });

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
      screen.getByRole("button", { name: "Envoyer a l'assistant" }),
    );

    await screen.findAllByText("C'est note, j'ai prepare la pesee.");

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Corrige plutot a 82,1 kg" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Completer le brouillon" }),
    );

    await waitFor(() => {
      expect(api.createAssistantDraft).toHaveBeenLastCalledWith({
        context: "measurements",
        currentDraft: {
          action: "create_body_measurement",
          confidence: "high",
          missingFields: [],
          payload: {
            date: "2026-06-09T08:00:00.000Z",
            weightKg: 82.4,
          },
          reply: "C'est note, j'ai prepare la pesee.",
          requiresConfirmation: true,
          summary: "Ajouter une pesee a 82.4 kg.",
        },
        history: [
          {
            content: "Ajoute ma pesee du jour a 82,4 kg",
            role: "user",
          },
          {
            content: "C'est note, j'ai prepare la pesee.",
            role: "assistant",
          },
        ],
        message: "Corrige plutot a 82,1 kg",
      });
    });
    expect(screen.getByText(/Historique/i)).toBeInTheDocument();
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
      reply: "J'ai prepare ta pesee, tu peux confirmer.",
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
      screen.getByRole("button", { name: "Envoyer a l'assistant" }),
    );

    await screen.findAllByText("J'ai prepare ta pesee, tu peux confirmer.");
    fireEvent.click(
      screen.getByRole("button", { name: "Confirmer et appliquer" }),
    );

    await waitFor(() => {
      expect(onApplyDraft).toHaveBeenCalledWith(draft);
    });
    expect(
      screen.getByText("Action appliquee. Les donnees ont ete rafraichies."),
    ).toBeInTheDocument();
    expect(screen.getByText("C'est ajoute. J'ai rafraichi les donnees.")).toBeInTheDocument();
  });

  it("sends the active draft when completing a conversation", async () => {
    const onApplyDraft = vi.fn();
    const firstDraft = {
      action: "create_meal" as const,
      confidence: "medium" as const,
      missingFields: ["quantities"],
      payload: {
        items: [{ foodId: "food-1", name: "Riz", resolvedName: "Riz" }],
        mealType: "lunch",
      },
      reply: "Il me manque la quantite du riz.",
      requiresConfirmation: true,
      summary: "Preparer un repas lunch.",
    };
    vi.mocked(api.createAssistantDraft)
      .mockResolvedValueOnce(firstDraft)
      .mockResolvedValueOnce({
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
        reply: "Tout est pret: tu peux confirmer.",
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
      target: { value: "Ajoute mon repas avec riz" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Envoyer a l'assistant" }),
    );

    await screen.findAllByText("Il me manque la quantite du riz.");
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "150g" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Completer le brouillon" }));

    await waitFor(() => {
      expect(api.createAssistantDraft).toHaveBeenLastCalledWith(
        expect.objectContaining({
          currentDraft: firstDraft,
          message: "150g",
        }),
      );
    });
    expect(screen.getAllByText("Tout est pret: tu peux confirmer.").length).toBeGreaterThan(0);
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
