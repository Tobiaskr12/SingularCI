import { Inject, Service } from "typedi";
import Trigger from "../SemanticModel/Trigger";
import Stage from "./Stage";
import Variables from '../SemanticModel/Variables';
import ITargets from './../SemanticModel/Targets';

@Service({ id: 'Pipeline' })
export default class Pipeline {    
    private platformTargets: ITargets;
    private variables: Variables;
    private trigger: Trigger;
    private stages: Stage[] = [];

    constructor(
        @Inject("Trigger") trigger: Trigger,
        @Inject("Targets") platformTargets: ITargets,
        @Inject("Variables") variables: Variables,
    ) {
        this.trigger = trigger;
        this.platformTargets = platformTargets;
        this.variables = variables;
    }

    setPlatformTargets(platformTargets: ITargets) {
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

    getPlatformTargets(): ITargets {
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
        this.platformTargets.reset();
        this.variables.reset();
        this.trigger.reset();
    }
}
