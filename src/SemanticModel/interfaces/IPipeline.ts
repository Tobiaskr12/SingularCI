import IStage from "./IStage";
import ITargets from "./ITargets";
import ITrigger from "./ITrigger";
import IVariables from "./IVariables";

export default interface IPipeline{
  setPlatformTargets(platformTargets: ITargets): void;
  setVariables(variables: IVariables): void;
  setTrigger(trigger: ITrigger): void;
  setStages(stages: IStage[]): void;
  addStage(stage: IStage): void;
  getPlatformTargets(): ITargets;
  getVariables(): IVariables;
  getTrigger(): ITrigger;
  getStages(): IStage[]
  reset(): void;
}