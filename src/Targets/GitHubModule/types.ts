export type TriggerType = {
  branches: string[]
}

export type StageObject = {
  container?: string,
  'runs-on'?: string,
  needs?: string[],
  steps: string[]
};

export type GitHubTriggerObject = {
  push?: TriggerType,
  pull_request?: TriggerType
}