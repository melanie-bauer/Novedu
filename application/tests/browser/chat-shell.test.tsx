import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { ChatShell } from "@/features/chat/ChatShell";

test("renders the minimal chat shell", async () => {
  const screen = await render(<ChatShell userId="browser-user" />);

  await expect.element(screen.getByTestId("chat-shell")).toBeVisible();
  await expect.element(screen.getByText("Novedu Tutor Chat")).toBeVisible();
});

test("renders latex, code blocks, and upload controls", async () => {
  const screen = await render(<ChatShell userId="browser-user" />);

  await expect.element(screen.getByTestId("latex-formula")).toBeVisible();
  await expect.element(screen.getByTestId("code-block")).toBeVisible();
  await expect.element(screen.getByTestId("document-upload")).toBeVisible();
});
