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
    id: "math-tutor",
    imageInput: false,
    model: "Qwen/Qwen-Demo",
    title: "Mathematik Tutor",
  },
];

test("renders the chatgpt-like shell", async () => {
  const screen = await render(
    <ChatShell
      models={models}
      tutors={tutors}
      userId="browser-user"
      userLabel="student@example.org"
    />,
  );

  await expect.element(screen.getByTestId("chat-shell")).toBeVisible();
  await expect
    .element(screen.getByRole("heading", { name: "Mathematik Tutor" }))
    .toBeVisible();
  await expect.element(screen.getByText("student@example.org")).toBeVisible();
  await expect
    .element(screen.getByTestId("copilot-welcome-screen"))
    .toBeVisible();
});

test("opens the model and tutor picker", async () => {
  const screen = await render(
    <ChatShell
      models={models}
      tutors={tutors}
      userId="browser-user"
      userLabel="student@example.org"
    />,
  );

  await screen.getByRole("button", { name: "Mathematik Tutor" }).click();
  await expect.element(screen.getByText("Tutoren")).toBeVisible();
  await expect.element(screen.getByText("Modelle")).toBeVisible();
  await expect.element(screen.getByText("Qwen Demo")).toBeVisible();
});
