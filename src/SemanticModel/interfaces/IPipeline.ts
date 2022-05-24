import Stage from "../Stage";
import ITargets from "./ITargets";
import ITrigger from "./ITrigger";
import IVariables from "./IVariables";

export default interface IPipeline{
  setPlatformTargets(platformTargets: ITargets): void;
  setVariables(variables: IVariables): void;
  setTrigger(trigger: ITrigger): void;
  setStages(stages: Stage[]): void;
  addStage(stage: Stage): void;
  getPlatformTargets(): ITargets;
  getVariables(): IVariables;
  getTrigger(): ITrigger;
  getStages(): Stage[]
  reset(): void;
}