import { Inject, Service } from "typedi";
import Stage from "./Stage";
import ITargets from "./interfaces/ITargets";
import ITrigger from "./interfaces/ITrigger";
import IVariables from "./interfaces/IVariables";
import IPipeline from "./interfaces/IPipeline";

@Service({ id: 'Pipeline' })
export default class Pipeline implements IPipeline {    
    private platformTargets: ITargets;
    private variables: IVariables;
    private trigger: ITrigger;
    private stages: Stage[] = [];

    constructor(
        @Inject("Trigger") trigger: ITrigger,
        @Inject("Targets") platformTargets: ITargets,
        @Inject("Variables") variables: IVariables,
    ) {
        this.trigger = trigger;
        this.platformTargets = platformTargets;
        this.variables = variables;
    }

    setPlatformTargets(platformTargets: ITargets) {
        this.platformTargets = platformTargets;
    }

    setVariables(variables: IVariables) {
        this.variables = variables;
    }

    setTrigger(trigger: ITrigger) {
        this.trigger = trigger;
    }

    addStage(stage: Stage) {
        this.stages.push(stage);
    }

    getPlatformTargets(): ITargets {
        return this.platformTargets;
    }

    getVariables(): IVariables {
        return this.variables;
    }

    getTrigger(): ITrigger {
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
