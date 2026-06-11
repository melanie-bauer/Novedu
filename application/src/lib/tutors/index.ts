// Public surface of the reusable tutor validator/builder core.

export { assembleSystemPrompt } from "./assemble";
export { type ConsistencyResult, checkConsistency, type ResolvedFragment } from "./consistency";
export type {
  BuildResult,
  ErrorCode,
  ValidationError,
  ValidationWarning,
  WarningCode,
} from "./errors";
export { defaultFetcher, type Fetcher, type FetchResponse } from "./fetcher";
export { loadAndBuildTutorPrompt } from "./load";
export { parseYaml, validate } from "./parse";
export {
  type Fragment,
  type FragmentFile,
  FragmentFileSchema,
  type FragmentRef,
  type InputSchema,
  type Tutor,
  TutorSchema,
  type VariableValue,
} from "./schemas";
