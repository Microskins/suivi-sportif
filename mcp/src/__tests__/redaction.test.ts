import { describe, expect, it } from "vitest";
import { maskEmail, redactObject, redactText, truncateText } from "../utils/redaction.js";

describe("redaction", () => {
  it("masks emails in text", () => {
    expect(redactText("contact test@example.com")).toBe("contact t***@e***.com");
  });

  it("redacts secret-like values in text", () => {
    const result = redactText(
      'DATABASE_URL="postgresql://user:pass@localhost:5432/app" JWT_SECRET=abc',
    );

    expect(result).not.toContain("user:pass");
    expect(result).not.toContain("abc");
    expect(result).toContain("[REDACTED]");
  });

  it("redacts secret-like object keys recursively", () => {
    expect(
      redactObject({
        nested: {
          email: "coach@example.com",
          token: "secret-token",
        },
      }),
    ).toEqual({
      nested: {
        email: "c***@e***.com",
        token: "[REDACTED]",
      },
    });
  });

  it("keeps masked email deterministic", () => {
    expect(maskEmail("a@domain.test")).toBe("a***@d***.test");
  });

  it("truncates long text", () => {
    expect(truncateText("abcdef", 3)).toBe("abc\n[TRUNCATED 3 chars]");
  });
});

