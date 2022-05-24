import Job from "../Job";

export default interface IStage{
  getName():string;
  getJobs():Job[];
  getNeeds():string[];
  getRunsOn():string;
}