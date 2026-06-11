import { spawn } from "node:child_process";

const baseUrl = "http://127.0.0.1:3000";
const isWindows = process.platform === "win32";

function spawnCommand(
  command: string,
  args: string[],
  env = process.env,
  stdio: "ignore" | "inherit" = "inherit",
) {
  return spawn(command, args, {
    cwd: process.cwd(),
    env,
    shell: false,
    stdio,
  });
}

async function waitForServer() {
  const deadline = Date.now() + 120_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);

      if (response.ok) {
        return;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  throw new Error(`Timed out waiting for ${baseUrl}`);
}

async function stopServer(serverProcess: ReturnType<typeof spawn>) {
  if (serverProcess.killed) {
    return;
  }

  const exited = new Promise<void>((resolve) => {
    serverProcess.once("exit", () => resolve());
  });

  if (isWindows) {
    const taskkill = spawn(
      "taskkill",
      ["/pid", String(serverProcess.pid), "/t", "/f"],
      {
        stdio: "ignore",
      },
    );
    await new Promise<void>((resolve) => {
      taskkill.once("exit", () => resolve());
    });
  } else {
    serverProcess.kill("SIGTERM");
  }

  await Promise.race([
    exited,
    new Promise<void>((resolve) => setTimeout(resolve, 2_000)),
  ]);
}

async function main() {
  const nextProcess = spawnCommand(
    "node",
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3000",
    ],
    process.env,
    "ignore",
  );

  try {
    await waitForServer();

    const testProcess = spawnCommand(
      "node",
      ["node_modules/@playwright/test/cli.js", "test", "--reporter=list"],
      {
        ...process.env,
        PLAYWRIGHT_SKIP_WEB_SERVER: "1",
      },
    );

    const exitCode = await new Promise<number>((resolve) => {
      testProcess.on("exit", (code) => resolve(code ?? 1));
    });

    process.exitCode = exitCode;
  } finally {
    await stopServer(nextProcess);
  }

  process.exit(process.exitCode ?? 0);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
