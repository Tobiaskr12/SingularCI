import { Service } from "typedi";
import Trigger from "../SemanticModel/Trigger";
import Stage from "./Stage";
import Targets from '../SemanticModel/Targets';
import Variables from '../SemanticModel/Variables';


@Service({ id: 'Pipeline' })
export default class Pipeline {    
    private platformTargets: Targets;
    private variables: Variables;
    private trigger: Trigger;
    private stages: Stage[] = [];

    constructor() {
        this.trigger = new Trigger();
        this.platformTargets = new Targets();
        this.variables = new Variables();
    }

    setPlatformTargets(platformTargets: Targets) {
        this.platformTargets = platformTargets;
    }

    setVariables(variables: Variables) {
        this.variables = variables;
    }

    setTrigger(trigger: Trigger) {
        this.trigger = trigger;
    }

    addStage(stage: Stage) {
        this.stages.push(stage);
    }

    getPlatformTargets(): Targets {
        return this.platformTargets;
    }

    getVariables(): Variables {
        return this.variables;
    }

    getTrigger(): Trigger {
        return this.trigger;
    }

    getStages(): Stage[] {
        return this.stages;
    }

    setStages(stages: Stage[]) {
        this.stages = stages;
    }

    reset() {
        this.stages = [];
        this.platformTargets = new Targets();
        this.variables = new Variables();
        this.trigger = new Trigger();
    }
}
