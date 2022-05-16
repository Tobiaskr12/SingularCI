type TriggerType = {
  branches: string[]
}

type StageObject = {
  'runs-on': string,
  needs?: string,
  steps: any[]
};

interface GitHubTriggerObject {
  push?: TriggerType,
  pull_request?: TriggerType
}