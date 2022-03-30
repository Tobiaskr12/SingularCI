import Job from './Job';

export default class Stage{
    constructor(
        private name: string,
        private jobs: Job[],
        private predecessors: string[],
        private runs_on: string
        ){}
    getName(): string{
        return this.name;
    }

    getJobs(): Job[]{
        return this.jobs;
    }

    getPredecessors(): string[]{
        return this.predecessors;
    }

    getRunsOn(): string{
        return this.runs_on;
    }
}