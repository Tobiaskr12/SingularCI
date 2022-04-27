import Job, { JobSyntaxType } from './Job';

export type StageSyntaxType = {
    name: string,
    runs_on: string,
    needs?: string,
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

    setName(name: string){
        this.name = name;
    }

    getJobs(): Job[]{
        return this.jobs;
    }

    setJobs(jobs: Job[]){
        this.jobs = jobs;
    }

    getNeeds(): string[]{
        return this.needs;
    }

    setNeeds(needs: string[]) {
        this.needs = needs;
    }

    getRunsOn(): string{
        return this.runs_on;
    }

    setRunsOn(runs_on: string) {
        this.runs_on = runs_on;
    }
}