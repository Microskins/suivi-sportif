const SECRET_KEY_PATTERN =
  /(secret|token|password|passwd|pwd|authorization|api[_-]?key|database[_-]?url|jwt)/i;

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

const SECRET_TEXT_PATTERNS: Array<[RegExp, string]> = [
  [
    /([A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PASSWD|PWD|AUTHORIZATION|API_KEY|DATABASE_URL|JWT)[A-Z0-9_]*\s*[:=]\s*)(["']?)[^\s"',]+/gi,
    "$1$2[REDACTED]",
  ],
  [/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]"],
  [/postgres(?:ql)?:\/\/[^\s"']+/gi, "postgresql://[REDACTED]"],
];

export function maskEmail(value: string): string {
  const [localPart, domain] = value.split("@");

  if (!localPart || !domain) {
    return "[REDACTED_EMAIL]";
  }

  const firstLetter = localPart.slice(0, 1);
  const [domainName, ...domainRest] = domain.split(".");
  const safeDomain =
    domainRest.length > 0
      ? `${domainName.slice(0, 1)}***.${domainRest.join(".")}`
      : "d***";

  return `${firstLetter}***@${safeDomain}`;
}

export function redactText(value: string): string {
  return SECRET_TEXT_PATTERNS.reduce(
    (currentValue, [pattern, replacement]) =>
      currentValue.replace(pattern, replacement),
    value.replace(EMAIL_PATTERN, (email) => maskEmail(email)),
  );
}

export function truncateText(value: string, maxLength = 12000): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}\n[TRUNCATED ${value.length - maxLength} chars]`;
}

export function redactObject<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => redactObject(item)) as T;
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, itemValue]) => {
        if (SECRET_KEY_PATTERN.test(key)) {
          return [key, "[REDACTED]"];
        }

        return [key, redactObject(itemValue)];
      }),
    ) as T;
  }

  if (typeof value === "string") {
    return redactText(value) as T;
  }

  return value;
}

