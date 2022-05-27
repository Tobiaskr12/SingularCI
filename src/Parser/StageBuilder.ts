import Job from '../SemanticModel/Job'

export default class StageBuilder {
    private name = "";
    private jobs: Job[] = [];
    private needs: string[] = [];
    private runs_on = "";
    
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

    addNeeds(stageName: string) {
        if (stageName.length > 0) {
            this.needs.push(stageName);
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