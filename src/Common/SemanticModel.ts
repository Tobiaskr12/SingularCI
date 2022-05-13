import { Service } from "typedi";
import Trigger from "../SemanticModel/Trigger";
import Stage from "./Stage";


@Service({ id: 'SemanticModel' })
export default class SemanticModel {    
    private targets: string[] = [];
    private variables: Record<string, string> = {};
    private trigger: Trigger;
    private stages: Stage[] = [];

    constructor() {
        this.trigger = new Trigger();
    }

    setTargets(targets: string[]) {
        this.targets = targets;
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

    getTargets(): string[] {
        return this.targets;
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
        this.targets = [];
        this.variables = {};
        this.trigger = new Trigger();
    }
}
