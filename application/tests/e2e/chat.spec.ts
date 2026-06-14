import { expect, test } from "@playwright/test";

const videoHoldMs = Number(process.env.E2E_VIDEO_HOLD_MS ?? 2000);

test.afterEach(async ({ page }) => {
  if (videoHoldMs > 0) {
    await page.waitForTimeout(videoHoldMs);
  }
});

test("root redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Novedu" })).toBeVisible();
});

test("root redirects authenticated users to chat", async ({
  context,
  page,
}) => {
  await context.addCookies([
    {
      name: "novedu-mock-session",
      value: "student",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);

  await page.goto("/");

  await expect(page).toHaveURL(/\/chat$/);
  await expect(
    page.getByRole("heading", { name: "Novedu Tutor Chat" }),
  ).toBeVisible();
});

test("unauthenticated chat access redirects to login", async ({ page }) => {
  await page.goto("/chat");

  await expect(page).toHaveURL(
    /\/login\?callbackUrl=%2Fchat|\/login\?callbackUrl=\/chat/,
  );
  await expect(page.getByRole("heading", { name: "Novedu" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Mit Microsoft Entra ID anmelden" }),
  ).toHaveAttribute("href", /\/api\/auth\/signin\/azure-ad/);
  await expect(page.getByText("Anmeldung mit Schulaccount")).toBeVisible();
});

test("login page explains Microsoft provider errors", async ({ page }) => {
  await page.goto("/login?callbackUrl=/chat&error=azure-ad");

  await expect(
    page.getByText("Microsoft Anmeldung fehlgeschlagen"),
  ).toBeVisible();
});

test("mock authenticated user reaches chat", async ({ context, page }) => {
  await context.addCookies([
    {
      name: "novedu-mock-session",
      value: "teacher",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);

  await page.goto("/chat");

  await expect(
    page.getByRole("heading", { name: "Novedu Tutor Chat" }),
  ).toBeVisible();
  await expect(page.getByLabel("Chat-Ziel")).toBeVisible();
  await expect(
    page
      .locator('section[aria-labelledby="current-tutor"]')
      .getByText("Demo Mathematik Tutor"),
  ).toBeVisible();
  await expect(page.getByTestId("document-upload")).toBeVisible();
});
