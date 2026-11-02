// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GooglePhotosImport } from "./admin-google-photos";
import { forgetGoogleToken, parseDuration } from "./google-photos";

const STAGE = "5b0c3c52-7a3e-4c4e-9f0e-6a8f2f8d1a01";

type Call = { body?: unknown; headers: Record<string, string>; url: string };

function mockFetch(clientId: string | null) {
  const calls: Call[] = [];
  let polls = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit = {}) => {
      calls.push({
        url,
        body: init.body,
        headers: (init.headers ?? {}) as Record<string, string>,
      });
      const reply = (body: unknown, status = 200) =>
        new Response(JSON.stringify(body), { status });
      if (url.endsWith("/google-photos/config")) {
        return reply({ data: { clientId } });
      }
      if (url.endsWith("photospicker.googleapis.com/v1/sessions")) {
        return reply({
          id: "sess-1",
          pickerUri: "https://photos.google.com/picker/sess-1",
          pollingConfig: { pollInterval: "1s", timeoutIn: "60s" },
        });
      }
      if (url.includes("/v1/sessions/sess-1")) {
        polls += 1;
        return reply({ id: "sess-1", mediaItemsSet: polls >= 1 });
      }
      if (url.endsWith(`/stages/${STAGE}/photos/google`)) {
        return reply(
          {
            data: {
              photos: [{ id: "p1", alt: "Skye", caption: "", url: "/x.jpg" }],
              skipped: 1,
            },
          },
          201,
        );
      }
      return reply({ error: "?" }, 404);
    }),
  );
  return calls;
}

function stubGoogleIdentity() {
  const requestAccessToken = vi.fn();
  window.google = {
    accounts: {
      oauth2: {
        initTokenClient: (config) => ({
          requestAccessToken: () => {
            requestAccessToken();
            config.callback({ access_token: "ya29.jeton", expires_in: 3600 });
          },
        }),
      },
    },
  };
  return requestAccessToken;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete window.google;
  forgetGoogleToken();
});

describe("import Google Photos", () => {
  it("reste masqué sans clé client configurée", async () => {
    const calls = mockFetch(null);
    stubGoogleIdentity();
    render(
      <GooglePhotosImport
        stageId={STAGE}
        disabled={false}
        onAuthError={() => false}
        onImported={vi.fn()}
        readMetadata={() => ({ alt: "Skye", caption: "" })}
      />,
    );
    await waitFor(() => expect(calls).toHaveLength(1));
    expect(
      screen.queryByRole("button", { name: /google photos/i }),
    ).not.toBeInTheDocument();
  });

  it("connecte, attend la sélection puis fait importer par l'API", async () => {
    const calls = mockFetch("abc.apps.googleusercontent.com");
    const requestAccessToken = stubGoogleIdentity();
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const onImported = vi.fn();
    render(
      <GooglePhotosImport
        stageId={STAGE}
        disabled={false}
        onAuthError={() => false}
        onImported={onImported}
        readMetadata={() => ({ alt: "Skye", caption: "Juin" })}
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Importer depuis Google Photos",
      }),
    );

    expect(
      await screen.findByText(/1 photo importée \(1 ignorée/, undefined, {
        timeout: 4000,
      }),
    ).toBeInTheDocument();
    expect(requestAccessToken).toHaveBeenCalledOnce();
    expect(open).toHaveBeenCalledWith(
      "https://photos.google.com/picker/sess-1/autoclose",
      "_blank",
    );
    const importCall = calls.find((call) =>
      call.url.endsWith(`/stages/${STAGE}/photos/google`),
    )!;
    expect(JSON.parse(importCall.body as string)).toEqual({
      accessToken: "ya29.jeton",
      sessionId: "sess-1",
      alt: "Skye",
      caption: "Juin",
    });
    const sessionCall = calls.find((call) =>
      call.url.endsWith("/v1/sessions"),
    )!;
    expect(sessionCall.headers.Authorization).toBe("Bearer ya29.jeton");
    expect(onImported).toHaveBeenCalledWith([
      { id: "p1", alt: "Skye", caption: "", url: "/x.jpg" },
    ]);
  });

  it("ne contacte pas Google sans texte alternatif", async () => {
    mockFetch("abc.apps.googleusercontent.com");
    const requestAccessToken = stubGoogleIdentity();
    render(
      <GooglePhotosImport
        stageId={STAGE}
        disabled={false}
        onAuthError={() => false}
        onImported={vi.fn()}
        readMetadata={() => null}
      />,
    );
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Importer depuis Google Photos",
      }),
    );
    expect(requestAccessToken).not.toHaveBeenCalled();
  });

  it("lit les durées de l'API Picker", () => {
    expect(parseDuration("5s", 0)).toBe(5000);
    expect(parseDuration("1.5s", 0)).toBe(1500);
    expect(parseDuration(undefined, 42)).toBe(42);
  });
});
