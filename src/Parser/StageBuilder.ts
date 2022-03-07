import Job from '../Common/Job'
import Stage from '../Common/Stage'

export default class StageBuilder{
    constructor(
        private name:string,
        private jobs:Job[],
        private predecessors:Stage[],
        private runs_on:string,
        ){}
    
    setName(name:string){
        this.name = name;
    }

    getName():string{
        return this.name;
    }

    addJob(job:Job){
        this.jobs.push(job);
    }

    addPredecessor(stage:Stage){
        this.predecessors.push(stage);
    }

    setRunsOn(environment:string){
        this.runs_on = environment;
    }
}