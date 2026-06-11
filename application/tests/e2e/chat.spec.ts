import { expect, test } from "@playwright/test";

test("unauthenticated chat access redirects to login", async ({ page }) => {
  await page.goto("/chat");

  await expect(page).toHaveURL(
    /\/login\?callbackUrl=%2Fchat|\/login\?callbackUrl=\/chat/,
  );
  await expect(
    page.getByRole("heading", { name: "Sign in with Microsoft Entra ID" }),
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
