import { expect, test, type Page, type TestInfo } from "@playwright/test";

const SHARED_TICKET_PATH =
  "/prix-aliments?zone=59278&q=pates&categorie=%C3%89picerie";

async function attachPageScreenshot(
  page: Page,
  testInfo: TestInfo,
  name: string,
) {
  await testInfo.attach(name, {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
}

test.describe("ticket comparateur", () => {
  test("reste centre et borne sur desktop", async ({ page }, testInfo) => {
    await page.setViewportSize({ height: 1_000, width: 1_440 });
    await page.goto(SHARED_TICKET_PATH);

    const receipt = page.locator(".receipt");
    const receiptBox = await receipt.boundingBox();

    expect(receiptBox).not.toBeNull();
    expect(receiptBox?.width).toBeLessThanOrEqual(640);
    await expect(page.locator(".best-row")).toHaveCount(1);
    await expect(page.getByRole("button", { name: /imprimer/i })).toBeVisible();
    await attachPageScreenshot(page, testInfo, "ticket-desktop");
  });

  test("ne deborde pas sur mobile", async ({ page }, testInfo) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto(SHARED_TICKET_PATH);

    const layout = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      receiptWidth: document.querySelector(".receipt")?.getBoundingClientRect()
        .width,
      viewportWidth: window.innerWidth,
    }));

    expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.receiptWidth).toBeLessThanOrEqual(layout.viewportWidth);
    await expect(
      page.getByRole("heading", { name: "Penne rigate" }),
    ).toBeVisible();
    await attachPageScreenshot(page, testInfo, "ticket-mobile");
  });

  test("imprime le resume, les sources et le QR code en monochrome", async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ height: 1_123, width: 794 });
    await page.emulateMedia({ colorScheme: "light", media: "print" });
    await page.goto(SHARED_TICKET_PATH);

    await expect(page.getByRole("button", { name: /imprimer/i })).toBeHidden();
    await expect(page.getByText("Recherche imprimée")).toBeVisible();
    await expect(page.getByText(/Sources : fiches officielles/i)).toBeVisible();

    const qrCode = page.getByAltText(/QR code du ticket 59278-/i);
    await expect(qrCode).toBeVisible();
    await expect(qrCode).toHaveAttribute("src", /^data:image\/svg\+xml/);

    const bestOfferStyle = await page
      .locator(".best-row")
      .first()
      .evaluate((element) => ({
        borderStyle: getComputedStyle(element).borderStyle,
        labelColor: getComputedStyle(
          element.querySelector(".best-tag") as HTMLElement,
        ).color,
      }));

    expect(bestOfferStyle).toEqual({
      borderStyle: "double",
      labelColor: "rgb(28, 28, 28)",
    });
    await attachPageScreenshot(page, testInfo, "ticket-print");
  });
});
