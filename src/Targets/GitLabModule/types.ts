export interface GitLabJobObject {
  [key: string]: {
    image: string,
    stage: string,
    script: string[],
    needs: string[],
    services?: string[],
    before_script?: string[]
  }
}