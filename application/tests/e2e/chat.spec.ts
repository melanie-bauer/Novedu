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
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
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
  await expect(page.getByTestId("chat-shell")).toBeVisible();
});

test("unauthenticated chat access redirects to login", async ({ page }) => {
  await page.goto("/chat");

  await expect(page).toHaveURL(
    /\/login\?callbackUrl=%2Fchat|\/login\?callbackUrl=\/chat/,
  );
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Mit Microsoft Entra ID anmelden" }),
  ).toBeVisible();
});

test("login page explains provider errors", async ({ page }) => {
  await page.goto("/login?callbackUrl=/chat&error=azure-ad");

  await expect(page.getByText("Anmeldung fehlgeschlagen")).toBeVisible();
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

  await expect(page.getByTestId("chat-shell")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Mathematik Tutor" }),
  ).toBeVisible();
  await expect(page.getByPlaceholder("Nachricht an Novedu...")).toBeVisible();
});
