import YAML from 'yaml';
import fs from 'fs';
import path from 'path';
import StageSymbolTable from './StageSymbolTable';
import StageBuilder from './StageBuilder';
import JobBuilder from './JobBuilder';
import Run from '../SemanticModel/Tasks/Run';
import BuildDockerImage from './../SemanticModel/Tasks/BuildDockerImage';
import Job from '../Common/Job';
import Stage, { StageSyntaxType } from '../Common/Stage';
import SemanticModel from '../Common/SemanticModel';
import Targets from './../SemanticModel/Targets';
import Variables from './../SemanticModel/Variables';
import Trigger, { Triggers } from '../SemanticModel/Trigger';
import { TaskSyntaxType } from '../Common/Task';

export default class DSLParser{

  private inputFileClone;

  constructor(inputFileName: string) {
    let inputFilePath = path.join(process.cwd(), inputFileName);
    let fileCloneName = '.singularci-copy.yaml';
    let fileClonePath = path.join(process.cwd(), fileCloneName);
    
    fs.copyFileSync(inputFilePath, fileClonePath);
    
    this.inputFileClone = fs.readFileSync(fileClonePath, 'utf8');;
  }

  parse(): SemanticModel {
    const variables = this.buildVariables();
    this.resolveVariables(variables);
    
    const targets = this.buildTargets();
    const triggers = this.buildTriggers();
    const stages = this.buildStages();

    this.buildSymbolTable(stages);

    return this.buildSemanticModel(targets, variables, triggers);
  }

  private resolveVariables(variables: Record<string, string>): void {
    for (let variable in variables) {
      this.inputFileClone = this.inputFileClone.replace("${" + variable + "}", variables[variable]);
    }

    // The regex tests if there are any undeclared variables in the file, which are not platform specific secrets
    let undefinedVariables = this.inputFileClone.match(/\$\{(?!secrets\.)[a-zA-Z][^{}]+\}/gm);

    if (undefinedVariables != null) {
      throw new Error(`Error: The following variable(s) are used, but not declared: ${undefinedVariables}`);
    }
  }

  private buildTargets(): string[] {
    try {
      const targetsArray = YAML.parse(this.inputFileClone)['pipeline']['targets']; 
      const targets = new Targets();
      
      for (let target of targetsArray) {
        targets.addTarget(target);
      }

      return targets.getTargets();
    } catch (error: any) {
      // TODO: throw custom error
      throw new Error(error.message);
    }
  }
  
  private buildTriggers(): Triggers {
    try {
      const triggersArray = YAML.parse(this.inputFileClone)['pipeline']['triggers'];
      const triggers = new Trigger();

      for (let triggerTypes of triggersArray.trigger_types) {
        triggers.addType(triggerTypes);
      }

      for (let triggerBranch of triggersArray.branches) {
        triggers.addBranch(triggerBranch);
      }
      
      return triggers.getTriggers();
    } catch (error: any) {
      // TODO: throw custom error
      throw new Error(error.message);
    }
  }

  private buildVariables(): Record<string, string> {
    try {
      const variablesArray = YAML.parse(this.inputFileClone)['pipeline']['variables'];
      const variables = new Variables();

      for (let variable of variablesArray) {
        variables.addVariable(variable.key, variable.value);
      }

      return variables.getVariables();
    } catch (error: any) {
      // TODO: throw custom error
      throw new Error(error.message);
    }
  }

  private buildStages(): StageBuilder[]  {
    try {
      const stages = YAML.parse(this.inputFileClone)['pipeline']['stages'];
      const stageList: StageBuilder[] = [];

      for (let stageObject of stages) {
        stageList.push(this.buildStage(stageObject.stage))
      }

      return stageList;
    } catch (error: any) {
      // TODO: throw custom error
      throw new Error(error.message);
    }
  }
  
  private buildSymbolTable(stages: StageBuilder[]) {
    const stageSymbolTable = StageSymbolTable.getInstance();

    for (let stage of stages) { 
      stageSymbolTable.addStage(stage);
    }
  }

  private buildStage(stage: StageSyntaxType): StageBuilder {
    const stageBuilder = new StageBuilder();

    if (stage.name && stage.runs_on && stage.job) {
      stageBuilder.setName(stage.name);
      stageBuilder.setRunsOn(stage.runs_on);
    
      this.addNeedsToStage(stage, stageBuilder);
      this.populateJobs(stage, stageBuilder);

    } else {
      // TODO: throw custom error
      throw new Error(`Stage is missing a name or runs_on property`);
    }

    return stageBuilder;
  }

  private addNeedsToStage(stage: StageSyntaxType, stageBuilder: StageBuilder) {
    if (stage.needs) {
      for (let need of stage.needs) {
        stageBuilder.addNeeds(need);
      }
    }
  }

  private populateJobs(stage: StageSyntaxType, stageBuilder: StageBuilder) {
    for (let job of stage.job) {
      const jobBuilder = new JobBuilder();
      this.addTasksToJob(job, jobBuilder);

      stageBuilder.addJob(
        new Job(jobBuilder.getTasks())
      );
    }
  }

  private addTasksToJob(task: TaskSyntaxType, jobBuilder: JobBuilder) {
    if (task.run) {
      const run = new Run(task.name, task.run);
      jobBuilder.addTask(run);
    } 
    
    if (task.docker_build) { 
      const docker_build = new BuildDockerImage(
        task.name,
        task.docker_build.image_name,
        task.docker_build.docker_file_path
      )
      jobBuilder.addTask(docker_build);
    }
  }

  private buildSemanticModel(targets: string[], variables: Record<string, string>, trigger: Triggers): SemanticModel {
    const stageSymbolTable = StageSymbolTable.getInstance();
    const semanticModel = new SemanticModel();

    for (let stage in stageSymbolTable.getStages()) {
      const stageBuilder = stageSymbolTable.getStage(stage);
      const finalStage = new Stage(
        stageBuilder.getName(),
        stageBuilder.getJobs(),
        stageBuilder.getNeeds(),
        stageBuilder.getRunsOn()
      )
      semanticModel.addStage(finalStage);
    }

    semanticModel.setTargets(targets);
    semanticModel.setVariables(variables);
    semanticModel.setTrigger(trigger);

    return semanticModel;
  }
}