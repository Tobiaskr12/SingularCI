export type TriggerType = {
  branches: string[]
}

export type StageObject = {
  'runs-on': string,
  needs?: string,
  steps: any[]
};

export type GitHubTriggerObject = {
  push?: TriggerType,
  pull_request?: TriggerType
}