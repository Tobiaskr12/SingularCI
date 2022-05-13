import { Service } from "typedi";
import Trigger from "../SemanticModel/Trigger";
import Stage from "./Stage";
import Targets from './../SemanticModel/Targets';


@Service({ id: 'SemanticModel' })
export default class SemanticModel {    
    private platformTargets: Targets;
    private variables: Record<string, string> = {};
    private trigger: Trigger;
    private stages: Stage[] = [];

    constructor() {
        this.trigger = new Trigger();
        this.platformTargets = new Targets();
    }

    setPlatformTargets(platformTargets: Targets) {
        this.platformTargets = platformTargets;
    }

    setVariables(variables: Record<string, string>) {
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

    getVariables(): Record<string, string> {
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
        this.variables = {};
        this.trigger = new Trigger();
    }
}
