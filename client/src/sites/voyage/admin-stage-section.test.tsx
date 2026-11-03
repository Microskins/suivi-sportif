// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { StageSection } from "./admin-ui";

afterEach(cleanup);

function Section({ invalid = false }: { invalid?: boolean }) {
  const [value, setValue] = useState("");
  return (
    <StageSection number={1} tone="blue" title="Repères" hint="Aide">
      <label>
        Code
        <input
          value={value}
          aria-invalid={invalid}
          onChange={(event) => setValue(event.target.value)}
        />
      </label>
    </StageSection>
  );
}

describe("section repliable d'une etape", () => {
  it("se replie et se deplie sans perdre la saisie", () => {
    render(<Section />);
    const toggle = screen.getByRole("button", { name: /Repères/ });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.change(screen.getByLabelText("Code"), {
      target: { value: "SKY" },
    });

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    // Masque mais toujours monte: la saisie survit au repli.
    expect(screen.getByLabelText("Code")).not.toBeVisible();
    expect(screen.getByText("Aide")).not.toBeVisible();

    fireEvent.click(toggle);
    expect(screen.getByLabelText("Code")).toBeVisible();
    expect(screen.getByLabelText("Code")).toHaveValue("SKY");
  });

  it("se rouvre quand un de ses champs devient invalide", () => {
    const { rerender } = render(<Section />);
    const toggle = screen.getByRole("button", { name: /Repères/ });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    rerender(<Section invalid />);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByLabelText("Code")).toBeVisible();
  });
});
