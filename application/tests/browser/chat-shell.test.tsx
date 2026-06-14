import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { ChatShell } from "@/features/chat/ChatShell";

const models = [
  {
    id: "qwen-demo",
    label: "Qwen Demo",
    model: "Qwen/Qwen-Demo",
  },
];

const tutors = [
  {
    description: "Hilft beim Zerlegen von Rechenwegen.",
    id: "math-demo",
    imageInput: false,
    model: "Qwen/Qwen-Demo",
    prompt: "Erklaere Mathematik schrittweise.",
    title: "Mathematik Demo Tutor",
  },
];

test("renders the minimal chat shell", async () => {
  const screen = await render(
    <ChatShell models={models} tutors={tutors} userId="browser-user" />,
  );

  await expect.element(screen.getByTestId("chat-shell")).toBeVisible();
  await expect.element(screen.getByText("Novedu Tutor Chat")).toBeVisible();
  await expect.element(screen.getByLabelText("Chat-Ziel")).toBeVisible();
  await expect.element(screen.getByText("Qwen/Qwen-Demo")).toBeVisible();
  await expect.element(screen.getByText("Aktueller Tutor")).toBeVisible();
});

test("renders latex, code blocks, and upload controls", async () => {
  const screen = await render(
    <ChatShell models={models} tutors={tutors} userId="browser-user" />,
  );

  await expect
    .element(screen.getByRole("heading", { name: "Modell" }))
    .toBeVisible();
  await expect
    .element(screen.getByText("Tutor-Konfiguration oder SCCH Modell"))
    .toBeVisible();
  await expect.element(screen.getByTestId("document-upload")).toBeVisible();
});

test("keeps the prototype-inspired workflow visible around the composer", async () => {
  const screen = await render(
    <ChatShell models={models} tutors={tutors} userId="browser-user" />,
  );

  await expect
    .element(screen.getByText("Tutor-Konfiguration oder SCCH Modell"))
    .toBeVisible();
  await expect.element(screen.getByText("Dokumente")).toBeVisible();
  await expect.element(screen.getByText("CopilotKit Runtime")).toBeVisible();
});
