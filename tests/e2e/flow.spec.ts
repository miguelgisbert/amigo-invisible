import { test, expect } from "@playwright/test";

const email = `e2e-${Date.now()}@example.com`;
const password = "password123";
const drawName = "Amic invisible feina E2E";

test("complete organizer and participant flow", async ({
  page,
  browser,
}, testInfo) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error)));

  await page.addInitScript(() => {
    const windowWithMock = window as Window & { __opened?: string[] };
    windowWithMock.__opened = [];
    windowWithMock.open = ((url?: string | URL) => {
      windowWithMock.__opened?.push(String(url));
      return null;
    }) as typeof window.open;

    Object.defineProperty(navigator, "contacts", {
      configurable: true,
      value: {
        select: async () => [
          {
            name: ["Ana"],
            tel: ["600111222"],
            email: ["ana@example.com"],
          },
          {
            name: ["Luis"],
            tel: ["600333444"],
            email: [],
          },
        ],
      },
    });
  });

  // Anonymous organizer is sent to the auth gate.
  await page.goto("/ca/crear");
  await expect(
    page.getByText("Inicia sessió per crear el sorteig"),
  ).toBeVisible();

  // Register and return to the draw wizard.
  await page.getByRole("link", { name: "Crea un compte" }).click();
  await expect(page).toHaveURL(/\/ca\/registre/);
  await page.locator("#auth-email").fill(email);
  await page.locator("#auth-password").fill(password);
  await page.getByRole("button", { name: "Crea el compte" }).click();
  await expect(page).toHaveURL(/\/ca\/crear/);
  await expect(
    page.getByRole("heading", { name: "Detalls del sorteig" }),
  ).toBeVisible();

  // Date picker: open, navigate months and choose today.
  await page.locator('button[aria-haspopup="dialog"]').click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Mes següent" }).click();
  await page.getByRole("button", { name: "Mes anterior" }).click();
  await page.getByRole("button", { name: "Avui" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(
    page.locator('button[aria-haspopup="dialog"]'),
  ).not.toContainText("Tria una data");

  await page.fill("#draw-name", drawName);
  await page.fill("#draw-budget", "20");
  await page.fill("#draw-location", "Oficina");
  await page.getByRole("button", { name: "Continua" }).click();

  // Import contacts and complete the participant list.
  await page.getByRole("button", { name: "Importa contactes" }).click();
  await expect(page.getByText("S'han importat 2 contactes.")).toBeVisible();
  await expect(page.locator("#participant-name-p1")).toHaveValue("Ana");
  await expect(page.locator("#participant-phone-p1")).toHaveValue("600111222");
  await expect(page.locator("#participant-name-p2")).toHaveValue("Luis");

  await page.locator("#participant-name-p3").fill("Marta");
  await page.locator("#participant-phone-p3").fill("600555666");
  await page.getByRole("button", { name: "Afegeix participant" }).click();
  await page.locator('input[id^="participant-name-"]').last().fill("Jordi");
  await page.locator('input[id^="participant-phone-"]').last().fill("600777888");

  // Language switch happens in place and preserves the form.
  await page.getByRole("button", { name: "Castellà" }).click();
  await expect(
    page.getByRole("heading", { name: "Participantes" }),
  ).toBeVisible();
  await expect(page.locator("#participant-name-p3")).toHaveValue("Marta");

  await page.getByRole("button", { name: "Catalán" }).click();
  await expect(
    page.getByRole("heading", { name: "Participants" }),
  ).toBeVisible();
  await expect(page.locator("#participant-name-p3")).toHaveValue("Marta");

  await page.getByRole("button", { name: "Continua" }).click();

  // Exclusion step.
  await page.getByRole("button", { name: "Afegeix una exclusió" }).click();
  await expect(
    page.getByText("Ana i Luis no es podran regalar."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continua" }).click();

  // Template preview and creation.
  await expect(page.getByText("Així es veurà al xat")).toBeVisible();
  const preview = page.locator("p.whitespace-pre-wrap").first();
  await expect(preview).toContainText("Li has de regalar a");

  const createResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/draws") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Crea el sorteig" }).click();
  const createResponse = await createResponsePromise;
  const payload = (await createResponse.json()) as { adminToken?: string };
  expect(createResponse.ok()).toBe(true);
  expect(payload.adminToken).toBeTruthy();
  const adminToken = payload.adminToken as string;

  await expect(page).toHaveURL(
    new RegExp(`/ca/admin/${adminToken}`),
  );
  await expect(page.getByText("Sorteig creat.")).toBeVisible();
  await expect(
    page.getByText("Ho tens sempre a «Els meus sortejos»"),
  ).toBeVisible();
  await expect(page.getByText("única manera")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Participants" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Envia els missatges" }),
  ).toHaveAttribute("href", "#participants");

  await expect(page.getByText("Emparellament ocult").first()).toBeVisible();
  await expect(page.getByText("Li toca regalar a")).toHaveCount(0);

  await page.getByRole("button", { name: "Mostra els emparellaments" }).click();
  await expect(page.getByText("Li toca regalar a").first()).toBeVisible();

  // WhatsApp confirmation flow.
  const firstCard = page.locator("main ul > li").first();
  await firstCard.getByRole("button", { name: "Envia WhatsApp" }).click();
  await expect(firstCard.getByText("Has enviat el missatge?")).toBeVisible();

  const opened = await page.evaluate(
    () => (window as Window & { __opened?: string[] }).__opened ?? [],
  );
  expect(opened.some((url) => url.startsWith("https://wa.me/"))).toBe(true);

  await firstCard
    .getByRole("button", { name: "Sí, marca'l com enviat" })
    .click();
  await expect(firstCard.getByText("Enviat per WhatsApp")).toBeVisible();

  await page.screenshot({
    path: testInfo.outputPath("admin-created.png"),
    fullPage: true,
  });

  // Dashboard lists the draw and links to the panel.
  await page.goto("/ca/sortejos");
  await expect(
    page.getByRole("heading", { name: "Els meus sortejos" }),
  ).toBeVisible();
  await expect(page.getByText(drawName)).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
  const panelLink = page.getByRole("link", { name: "Obre el panell" }).first();
  await expect(panelLink).toHaveAttribute(
    "href",
    new RegExp(`/ca/admin/${adminToken}`),
  );

  await page.screenshot({
    path: testInfo.outputPath("dashboard.png"),
    fullPage: true,
  });

  // Logout, dashboard gate, then login again.
  await page.getByRole("button", { name: "Surt" }).click();
  await expect(page).toHaveURL(/\/ca$/);
  await expect(page.getByRole("link", { name: "Entra" })).toBeVisible();

  await page.goto("/ca/sortejos");
  await expect(
    page.getByText("Inicia sessió per veure els teus sortejos"),
  ).toBeVisible();
  await page.getByRole("link", { name: "Entra" }).click();
  await expect(page).toHaveURL(/\/ca\/entrar/);
  await page.locator("#auth-email").fill(email);
  await page.locator("#auth-password").fill(password);
  await page.getByRole("button", { name: "Entra" }).click();
  await expect(page).toHaveURL(/\/ca\/sortejos/);
  await expect(page.getByText(drawName)).toBeVisible();

  // The organizer link still works anonymously in a fresh context.
  const anonymousContext = await browser.newContext();
  const anonymousPage = await anonymousContext.newPage();
  await anonymousPage.goto(`/ca/admin/${adminToken}`);
  await expect(
    anonymousPage.getByRole("heading", { name: "Participants" }),
  ).toBeVisible();
  await anonymousContext.close();

  // Reveal page and copy-link action.
  const adminDataResponse = await page.request.get(
    `/api/draws/${adminToken}?locale=ca`,
  );
  expect(adminDataResponse.ok()).toBe(true);
  const adminData = (await adminDataResponse.json()) as {
    participants: Array<{ token: string; name: string; assignment: { name: string } }>;
  };
  const participant = adminData.participants[0];

  await page.goto(`/ca/r/${participant.token}`);
  await expect(
    page.getByText("Et toca regalar a", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1 }),
  ).toHaveText(participant.assignment.name);
  await page.getByRole("button", { name: "Guarda l'enllaç" }).click();
  await expect(
    page.getByRole("button", { name: "Enllaç copiat" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Afegeix al calendari" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Organitza el teu propi amic invisible" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Castellà" }).click();
  await expect(
    page.getByText("Te toca regalar a", { exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/es/r/${participant.token}`));

  await page.screenshot({
    path: testInfo.outputPath("reveal-es.png"),
    fullPage: true,
  });

  expect(consoleErrors).toEqual([]);
});
