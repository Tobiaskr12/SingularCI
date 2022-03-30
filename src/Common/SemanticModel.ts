import Targets from "../SemanticModel/Targets";
import Trigger from "../SemanticModel/Trigger";
import Variables from "../SemanticModel/Variables";
import Stage from "./Stage";

export default class SemanticModel {    
    private targets: Targets = new Targets([]);
    private variables: Variables = new Variables({});
    private trigger: Trigger = new Trigger([], []);
    private stages: Stage[] = [];

    setTargets(target: Targets) {
        this.targets = target;
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

    getTargets(): Targets {
        return this.targets;
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
}