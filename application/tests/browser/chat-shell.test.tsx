import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { ChatShell } from "@/features/chat/ChatShell";

test("renders the minimal chat shell", async () => {
  const screen = await render(<ChatShell userId="browser-user" />);

  await expect.element(screen.getByTestId("chat-shell")).toBeVisible();
  await expect.element(screen.getByText("Novedu Tutor Chat")).toBeVisible();
  await expect
    .element(screen.getByRole("button", { name: "Neuer Chat" }))
    .toBeVisible();
  await expect
    .element(screen.getByPlaceholder("Chats durchsuchen..."))
    .toBeVisible();
  await expect.element(screen.getByText("Aktueller Tutor")).toBeVisible();
});

test("renders latex, code blocks, and upload controls", async () => {
  const screen = await render(<ChatShell userId="browser-user" />);

  await expect.element(screen.getByTestId("latex-formula")).toBeVisible();
  await expect.element(screen.getByTestId("code-block")).toBeVisible();
  await expect.element(screen.getByTestId("document-upload")).toBeVisible();
});

test("keeps the prototype-inspired workflow visible around the composer", async () => {
  const screen = await render(<ChatShell userId="browser-user" />);

  await expect.element(screen.getByText("Verlauf")).toBeVisible();
  await expect.element(screen.getByText("Dokumente")).toBeVisible();
  await expect
    .element(screen.getByRole("textbox", { name: "Message" }))
    .toBeVisible();
  await expect
    .element(screen.getByRole("button", { name: "Send" }))
    .toBeVisible();
});
