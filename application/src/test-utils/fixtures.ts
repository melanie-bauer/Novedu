import { fileURLToPath } from "node:url";

export function fixturePath(name: string): string {
  return fileURLToPath(
    new URL(`../../tests/fixtures/${name}`, import.meta.url),
  );
}
