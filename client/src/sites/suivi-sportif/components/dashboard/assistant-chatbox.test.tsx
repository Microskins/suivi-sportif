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
import { AssistantChatbox } from "./assistant-chatbox";

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

  it("affiche une reponse conversationnelle sans appliquer de mutation", async () => {
    const onApplyDraft = vi.fn().mockResolvedValue(undefined);
    const draft = {
      action: "unknown" as const,
      confidence: "medium" as const,
      missingFields: [],
      payload: {},
      reply: "Je peux t'aider à lire ton poids et à préparer la prochaine étape.",
      requiresConfirmation: false,
      summary: "Je peux t'aider à lire ton poids et à préparer la prochaine étape.",
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
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Modifie mon poids, je fais 103 kg maintenant" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

    await waitFor(() => {
      expect(api.createAssistantDraft).toHaveBeenCalledWith({
        context: "measurements",
        history: [],
        message: "Modifie mon poids, je fais 103 kg maintenant",
      });
    });
    expect(onApplyDraft).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        "Je peux t'aider à lire ton poids et à préparer la prochaine étape.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/brouillon|confirmer/i)).not.toBeInTheDocument();
  });

  it("reutilise l'historique conversationnel a chaque message", async () => {
    const onApplyDraft = vi.fn().mockResolvedValue(undefined);
    vi.mocked(api.createAssistantDraft)
      .mockResolvedValueOnce({
        action: "unknown",
        confidence: "medium",
        missingFields: [],
        payload: {},
        reply: "Je peux t'aider à faire le point sur ta semaine.",
        requiresConfirmation: false,
        summary: "Je peux t'aider à faire le point sur ta semaine.",
      })
      .mockResolvedValueOnce({
        action: "unknown",
        confidence: "medium",
        missingFields: [],
        payload: {},
        reply: "Tu peux regarder la tendance des derniers jours.",
        requiresConfirmation: false,
        summary: "Tu peux regarder la tendance des derniers jours.",
      });

    render(
      <AssistantChatbox
        isAuthBypassEnabled={false}
        onApplyDraft={onApplyDraft}
        resource="dashboard"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /chat ia/i }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Resume ma semaine" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

    await screen.findByText("Je peux t'aider à faire le point sur ta semaine.");

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Et ma tendance ?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

    await waitFor(() => {
      expect(api.createAssistantDraft).toHaveBeenLastCalledWith({
        context: "dashboard",
        history: [
          {
            content: "Resume ma semaine",
            role: "user",
          },
          {
            content: "Je peux t'aider à faire le point sur ta semaine.",
            role: "assistant",
          },
        ],
        message: "Et ma tendance ?",
      });
    });
    expect(
      screen.getByText("Tu peux regarder la tendance des derniers jours."),
    ).toBeInTheDocument();
    expect(onApplyDraft).not.toHaveBeenCalled();
  });

  it("desactive le chat lorsque le bypass auth est actif", () => {
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
