import Job from '../Common/Job'

export default class StageBuilder {
    private name: string = "";
    private jobs: Job[] = [];
    private needs: string[] = [];
    private runs_on: string = "";
    
    setName(name: string){
        this.name = name;
    }

    getName(): string{
        return this.name;
    }

    addJob(job: Job) {
        this.jobs.push(job);
    }

    getJobs(): Job[] {
        return this.jobs;
    }

    addNeeds(stage: string) {
        if (stage.length > 0) {
            this.needs.push(stage);
        }
    }

    getNeeds(): string[] {
        return this.needs;
    }

    setRunsOn(environment: string) {
        this.runs_on = environment;
    }

    getRunsOn(): string {
        return this.runs_on;
    }
}