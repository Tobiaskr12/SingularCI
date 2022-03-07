import Targets from './Targets';
import Trigger from './Trigger';
import Variables from './Variables';
import Stage from '../Common/Stage';
import SemanticModel from './../Common/SemanticModel';

export default class Pipeline implements SemanticModel {
    
  constructor(
        private targets: Targets,
        private variables: Variables,
        private trigger: Trigger,
        private stages: Stage[]
    ) {}

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