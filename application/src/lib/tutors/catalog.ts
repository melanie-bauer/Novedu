import type { TutorSummary } from "./catalog-types";
import type { BuildResult } from "./errors";
import {
  isGitHubTutorCatalogConfigured,
  listGitHubTutorSummaries,
  loadGitHubTutorById,
} from "./github-catalog";
import { listLocalTutorSummaries, loadLocalTutorById } from "./local-catalog";

export type { TutorSummary } from "./catalog-types";

export async function listTutorSummaries(): Promise<TutorSummary[]> {
  if (isGitHubTutorCatalogConfigured()) {
    return listGitHubTutorSummaries();
  }

  return listLocalTutorSummaries();
}

export async function loadTutorById(id: string): Promise<BuildResult> {
  if (isGitHubTutorCatalogConfigured()) {
    return loadGitHubTutorById(id);
  }

  return loadLocalTutorById(id);
}

/*
.env has GitHub owner + repo set => use GitHub
.env does not have them set => use local application/tutors fallback
 */
