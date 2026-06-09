import { afterEach, describe, expect, it, vi } from "vitest";
import * as domain from "../tools/domain.js";

const jwtToken = "jwt-test-token";

function mockApiResponse(status = 200, body: unknown = { data: { ok: true } }) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(body),
      ok: status >= 200 && status < 300,
      status,
    }),
  );
}

function latestFetchCall() {
  const fetchMock = vi.mocked(fetch);
  return fetchMock.mock.calls.at(-1);
}

describe("domain MCP API tools", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads the authenticated profile through the API", async () => {
    mockApiResponse();

    const result = await domain.getProfile({ jwtToken });
    const call = latestFetchCall();

    expect(result.ok).toBe(true);
    expect(call?.[0].toString()).toBe("http://127.0.0.1:3001/api/users/me");
    expect(call?.[1]).toMatchObject({
      headers: { authorization: `Bearer ${jwtToken}` },
      method: "GET",
    });
  });

  it("creates workouts through the API", async () => {
    mockApiResponse(201);

    await domain.createWorkout({
      date: "2026-06-08T12:00:00.000Z",
      duration: 45,
      jwtToken,
      name: "Push",
    });
    const call = latestFetchCall();

    expect(call?.[0].toString()).toBe("http://127.0.0.1:3001/api/workouts");
    expect(call?.[1]).toMatchObject({
      body: JSON.stringify({
        date: "2026-06-08T12:00:00.000Z",
        duration: 45,
        name: "Push",
      }),
      headers: {
        authorization: `Bearer ${jwtToken}`,
        "content-type": "application/json",
      },
      method: "POST",
    });
  });

  it("creates body measurements through the API", async () => {
    mockApiResponse(201);

    await domain.createBodyMeasurement({
      date: "2026-06-08T12:00:00.000Z",
      jwtToken,
      weightKg: 82.4,
    });
    const call = latestFetchCall();

    expect(call?.[0].toString()).toBe(
      "http://127.0.0.1:3001/api/body-measurements",
    );
    expect(call?.[1]).toMatchObject({
      body: JSON.stringify({
        date: "2026-06-08T12:00:00.000Z",
        weightKg: 82.4,
      }),
      method: "POST",
    });
  });

  it("deletes user goals through the API", async () => {
    mockApiResponse(204, null);

    await domain.deleteUserGoal({
      id: "11111111-1111-4111-8111-111111111111",
      jwtToken,
    });
    const call = latestFetchCall();

    expect(call?.[0].toString()).toBe(
      "http://127.0.0.1:3001/api/user-goals/11111111-1111-4111-8111-111111111111",
    );
    expect(call?.[1]).toMatchObject({
      method: "DELETE",
    });
  });
});
