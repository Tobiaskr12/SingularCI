import IStage from './interfaces/IStage';
import { Service } from 'typedi';
import Job, { JobSyntaxType } from './Job';

export type StageSyntaxType = {
    name: string,
    runs_on: string,
    needs?: string[],
    jobs: JobSyntaxType[]
}

@Service({ id: "StageFactory" })
export default class StageFactory {
    createStage(
        stageName: string,
        jobs: Job[],
        needs: string[],
        runsOn: string
    ): IStage {
        return new Stage(
            stageName,
            jobs,
            needs,
            runsOn
        );
    }
}

@Service({ id: "Stage" })
class Stage implements IStage {
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