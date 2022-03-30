import Job from '../Common/Job'

export default class StageBuilder {
    private name: string = "";
    private jobs: Job[] = [];
    private predecessors: string[] = [];
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

    addPredecessor(stage: string) {
        if (stage.length > 0) {
            this.predecessors.push(stage);
        }
    }

    getPredecessors(): string[] {
        return this.predecessors;
    }

    setRunsOn(environment: string){
        this.runs_on = environment;
    }

    getRunsOn(): string {
        return this.runs_on;
    }
}