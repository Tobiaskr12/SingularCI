import Job, { JobSyntaxType } from './Job';

export type StageSyntaxType = {
    name: string,
    runs_on: string,
    needs?: string[],
    jobs: JobSyntaxType[]
}

export default class Stage {
    constructor(
        private name: string,
        private jobs: Job[],
        private needs: string[],
        private runs_on: string
    ){}

    getName(): string{
        return this.name;
    }

    getJobs(): Job[]{
        return this.jobs;
    }

    getNeeds(): string[] {
        return this.needs;
    }

    getRunsOn(): string{
        return this.runs_on;
    }

}