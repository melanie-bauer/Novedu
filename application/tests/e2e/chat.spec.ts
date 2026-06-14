import { expect, test } from "@playwright/test";

const videoHoldMs = Number(process.env.E2E_VIDEO_HOLD_MS ?? 2000);

test.afterEach(async ({ page }) => {
  if (videoHoldMs > 0) {
    await page.waitForTimeout(videoHoldMs);
  }
});

test("unauthenticated chat access redirects to login", async ({ page }) => {
  await page.goto("/chat");

  await expect(page).toHaveURL(
    /\/login\?callbackUrl=%2Fchat|\/login\?callbackUrl=\/chat/,
  );
  await expect(
    page.getByRole("heading", { name: "Sign in with Microsoft Entra ID" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Continue with Microsoft" }),
  ).toHaveAttribute("href", /\/api\/auth\/signin\/azure-ad/);
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
  await expect(page.getByTestId("document-upload")).toBeVisible();
});

test("mock AG-UI stream renders assistant output", async ({
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

  await page.goto("/chat");
  await page.getByRole("button", { name: "Send" }).click();

  await expect(
    page.getByText("This response arrived through the AG-UI contract"),
  ).toBeVisible();
});
