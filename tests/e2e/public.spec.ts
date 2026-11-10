import { test, expect } from "@playwright/test";

test.describe("public experience", () => {
  test("landing, language switch and 404", async ({ page }) => {
    await page.goto("/es");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Organiza el amigo invisible",
    );

    await page.getByRole("button", { name: "Catalán" }).click();
    await expect(page).toHaveURL(/\/ca$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Organitza l'amic invisible",
    );

    await page.getByRole("button", { name: "Castellà" }).click();
    await expect(page).toHaveURL(/\/es$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Organiza el amigo invisible",
    );

    await page.goto("/ca/no-existeix");
    await expect(page.getByText("Aquesta pàgina no existeix.")).toBeVisible();

    await page.goto("/ca/entrar");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Inicia sessió",
    );

    await page.goto("/ca/crear");
    await expect(
      page.getByText("Inicia sessió per crear el sorteig"),
    ).toBeVisible();
  });

  test("PWA manifest, icons, service worker and install surface", async ({
    page,
  }) => {
    await page.goto("/ca");

    const manifestHref = await page
      .locator('link[rel="manifest"]')
      .getAttribute("href");
    expect(manifestHref).toBeTruthy();

    const manifestResponse = await page.request.get(
      manifestHref as string,
    );
    expect(manifestResponse.ok()).toBe(true);
    const manifest = await manifestResponse.json();
    expect(manifest.name).toContain("Amic invisible");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
    expect(
      manifest.icons.some(
        (icon: { sizes?: string }) => icon.sizes === "192x192",
      ),
    ).toBe(true);
    expect(
      manifest.icons.some(
        (icon: { sizes?: string }) => icon.sizes === "512x512",
      ),
    ).toBe(true);

    const ogImage = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    expect(ogImage).toContain("/og.png");

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    expect(jsonLd).toContain('"@type":"WebApplication"');
    expect(jsonLd).toContain('"price":"0"');

    const iconResponse = await page.request.get("/icons/icon-512.png");
    expect(iconResponse.ok()).toBe(true);
    const swResponse = await page.request.get("/sw.js");
    expect(swResponse.ok()).toBe(true);

    const scope = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) {
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      return registration.scope;
    });
    expect(scope).toContain("127.0.0.1:3101");
  });

  test("feedback form submits a message", async ({ page }) => {
    await page.goto("/ca");
    await page.getByRole("button", { name: "Suggeriments" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page
      .locator("#feedback-message")
      .fill("M'agrada molt l'eina. Voldria poder eliminar un sorteig.");
    await page.locator("#feedback-email").fill("feedback-e2e@example.com");
    await page.getByRole("button", { name: "Envia" }).click();

    await expect(page.getByText("Gràcies! Ho he rebut.")).toBeVisible();
    await page.getByRole("button", { name: "Tanca" }).last().click();
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("responsive layouts avoid horizontal overflow", async ({
    page,
  }, testInfo) => {
    const viewports = [
      { width: 320, height: 568, name: "320" },
      { width: 390, height: 844, name: "390" },
      { width: 768, height: 1024, name: "768" },
      { width: 1440, height: 900, name: "1440" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      for (const path of ["/ca", "/ca/entrar", "/ca/no-existeix"]) {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth + 1,
        );
        expect(overflow, `${path} at ${viewport.name}px`).toBe(false);
      }

      await page.goto("/ca");
      await testInfo.attach(`landing-${viewport.name}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });
    }
  });
});
