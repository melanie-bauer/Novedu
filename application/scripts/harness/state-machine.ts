import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type HarnessStage = "intake" | "reproduce" | "implement" | "verify" | "close";
type EvidenceKind = "before" | "checks" | "after";

type HarnessState = {
  stage: HarnessStage;
  evidence: Record<EvidenceKind, string[]>;
};

const stageOrder: HarnessStage[] = [
  "intake",
  "reproduce",
  "implement",
  "verify",
  "close",
];

const stageMessages: Record<HarnessStage, string> = {
  intake: "Read AGENTS.md, docs/harness/operating-model.md, and the issue.",
  reproduce: "Open the app and record before evidence for the issue.",
  implement: "Make the smallest code change that satisfies the issue criteria.",
  verify: "Run focused checks, then record after evidence in the browser.",
  close: "Update harness-progress.md and summarize evidence for review.",
};

function loadHarnessState(): HarnessState {
  const filePath = join(process.cwd(), "harness-state.json");
  return JSON.parse(readFileSync(filePath, "utf8")) as HarnessState;
}

function saveHarnessState(state: HarnessState) {
  const filePath = join(process.cwd(), "harness-state.json");
  writeFileSync(filePath, serializeHarnessState(state));
}

export function serializeHarnessState(
  state: HarnessState,
  platform: NodeJS.Platform = process.platform,
): string {
  const lineEnding = platform === "win32" ? "\r\n" : "\n";
  return `${JSON.stringify(state, null, 2)}\n`.replaceAll("\n", lineEnding);
}

function getNextStage(stage: HarnessStage): HarnessStage {
  const nextIndex = Math.min(
    stageOrder.indexOf(stage) + 1,
    stageOrder.length - 1,
  );

  return stageOrder[nextIndex];
}

function printStatus() {
  const state = loadHarnessState();

  console.log("Harness status");
  console.log("==============");
  console.log(`Stage: ${state.stage}`);
  console.log(`Next action: ${stageMessages[state.stage]}`);
  printEvidence("Before evidence", state.evidence.before);
  printEvidence("Check evidence", state.evidence.checks);
  printEvidence("After evidence", state.evidence.after);
}

function advance() {
  const state = loadHarnessState();
  const nextStage = getNextStage(state.stage);

  saveHarnessState({
    ...state,
    stage: nextStage,
  });

  console.log(`Advanced harness to: ${nextStage}`);
  console.log(`Next action: ${stageMessages[nextStage]}`);
}

function reset() {
  saveHarnessState({
    evidence: {
      after: [],
      before: [],
      checks: [],
    },
    stage: "intake",
  });

  console.log("Harness reset to: intake");
}

function addEvidence(
  kind: string | undefined,
  evidencePath: string | undefined,
) {
  if (!isEvidenceKind(kind)) {
    console.error(
      "Usage: npm run harness evidence <before|checks|after> <path>",
    );
    process.exitCode = 1;
    return;
  }

  if (!evidencePath) {
    console.error("Evidence path is required.");
    process.exitCode = 1;
    return;
  }

  const normalizedPath = evidencePath.replaceAll("\\", "/");

  if (!existsSync(join(process.cwd(), normalizedPath))) {
    console.error(`Evidence file does not exist: ${normalizedPath}`);
    process.exitCode = 1;
    return;
  }

  const state = loadHarnessState();
  const currentEntries = state.evidence[kind];

  saveHarnessState({
    ...state,
    evidence: {
      ...state.evidence,
      [kind]: currentEntries.includes(normalizedPath)
        ? currentEntries
        : [...currentEntries, normalizedPath],
    },
  });

  console.log(`Registered ${kind} evidence: ${normalizedPath}`);
}

function printEvidence(label: string, entries: string[]) {
  console.log(`${label}: ${entries.length}`);

  for (const entry of entries) {
    console.log(`- ${entry}`);
  }
}

function isEvidenceKind(kind: string | undefined): kind is EvidenceKind {
  return kind === "before" || kind === "checks" || kind === "after";
}

function main() {
  const command = process.argv[2] ?? "status";

  if (command === "status") {
    printStatus();
  } else if (command === "advance") {
    advance();
  } else if (command === "reset") {
    reset();
  } else if (command === "evidence") {
    addEvidence(process.argv[3], process.argv[4]);
  } else {
    console.error(`Unknown harness command: ${command}`);
    process.exitCode = 1;
  }
}

if (!process.env.VITEST) {
  main();
}
