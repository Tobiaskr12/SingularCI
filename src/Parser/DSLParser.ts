import YAML from 'yaml';
import fs from 'fs';
import path from 'path';
import StageSymbolTable from './StageSymbolTable';
import StageBuilder from './StageBuilder';
import JobBuilder from './JobBuilder';
import Run from '../SemanticModel/Tasks/Run';
import BuildDockerImage from './../SemanticModel/Tasks/BuildDockerImage';
import Job, { JobSyntaxType } from '../Common/Job';
import Stage, { StageSyntaxType } from '../Common/Stage';
import SemanticModel from '../Common/SemanticModel';
import Targets from './../SemanticModel/Targets';
import Variables from './../SemanticModel/Variables';
import Trigger from '../SemanticModel/Trigger';
import { Inject, Service } from 'typedi';
import { JobBuilderFactory } from './JobBuilderFactory';
import PullDockerImage from '../SemanticModel/Tasks/PullDockerImage';
import Checkout from '../SemanticModel/Tasks/Checkout';

@Service({ id: 'dslparser' })
class DSLParser{
  private inputFileClone;
  private fileClonePath;
  private semanticModel;
  private jobBuilderFactory;

  constructor(
    @Inject('dslparser.inputFileName') inputFileName: string,
    @Inject('SemanticModel') semanticModel: SemanticModel,
    @Inject('JobBuilderFactory') jobBuilderFactory: JobBuilderFactory
  ) {
    let inputFilePath = path.join(process.cwd(), inputFileName);
    let fileCloneName = '.singularci-copy.yml';
    this.fileClonePath = path.join(process.cwd(), fileCloneName);
    
    fs.copyFileSync(inputFilePath, this.fileClonePath);
    
    this.inputFileClone = fs.readFileSync(this.fileClonePath, 'utf8');
    this.semanticModel = semanticModel;
    this.jobBuilderFactory = jobBuilderFactory;
  }

  parse(): SemanticModel {
    const variables = this.buildVariables();
    this.resolveVariables(variables);
    
    const targets = this.buildTargets();
    const triggers = this.buildTriggers();
    const stages = this.buildStages();;

    this.buildSymbolTable(stages);

    return this.buildSemanticModel(targets, variables, triggers);
  }

  private resolveVariables(variables: Record<string, string>): void {
    for (let variable in variables) {
      this.inputFileClone = this.inputFileClone.replaceAll("${" + variable + "}", variables[variable]);
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
  
  private buildTriggers(): Trigger {
    try {
      const triggersArray = YAML.parse(this.inputFileClone)['pipeline']['triggers'];
      const triggers = new Trigger();

      for (let triggerTypes of triggersArray.trigger_types) {
        triggers.addType(triggerTypes);
      }

      for (let triggerBranch of triggersArray.branches) {
        triggers.addBranch(triggerBranch);
      }
      
      return triggers;
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
        stageList.push(this.buildStage(stageObject.stage));
      }

      return stageList;
    } catch (error: any) {
      // TODO: throw custom error
      throw new Error(error.message);
    }
  }
  
  private buildSymbolTable(stages: StageBuilder[]) {
    const stageSymbolTable = StageSymbolTable.getInstance();
    stageSymbolTable.reset();

    for (let stage of stages) { 
      stageSymbolTable.addStage(stage);
    }
  }

  private buildStage(stage: StageSyntaxType): StageBuilder {
    const stageBuilder = new StageBuilder();
    try {
      if (stage.name && stage.runs_on && stage.jobs) {
        stageBuilder.setName(stage.name);
        stageBuilder.setRunsOn(stage.runs_on);
      
        this.addNeedsToStage(stage, stageBuilder);
        this.populateJobs(stage, stageBuilder);
  
      } else {
        // TODO: throw custom error
        throw new Error(`Stage is missing a name or runs_on property`);
      }
    } catch (error: any) {
      console.error(error.message);
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
    for (let job of stage.jobs) {
      const jobBuilder = this.jobBuilderFactory.createJobBuilder();

      jobBuilder.setName(job.name);
      this.addTasksToJob(job, jobBuilder);

      stageBuilder.addJob(
        new Job(jobBuilder.getName(), jobBuilder.getTasks())
      );
    }
  }

  private addTasksToJob(job: JobSyntaxType, jobBuilder: JobBuilder) {
    if (job.run) {
      const run = new Run(job.run);
      jobBuilder.addTask(run);
    } 
    
    if (job.docker_build) { 
      const docker_build = new BuildDockerImage(
        job.docker_build.image_name,
        job.docker_build.docker_file_path,
        job.docker_build.user_name,
        job.docker_build.password  
      )
      jobBuilder.addTask(docker_build);
    }

    if (job.docker_pull) { 
      const docker_pull = new PullDockerImage(
        job.docker_pull.image_name,
        job.docker_pull.user_name,
        job.docker_pull.password
      )
      jobBuilder.addTask(docker_pull);
    }

    if (job.checkout) {
      const checkout = new Checkout(
        job.checkout.repo_url
      );

      jobBuilder.addTask(checkout);
    }
  }

  private buildSemanticModel(targets: string[], variables: Record<string, string>, trigger: Trigger): SemanticModel {
    const stageSymbolTable = StageSymbolTable.getInstance();
    
    this.semanticModel.reset();

    for (let stage in stageSymbolTable.getStages()) {
      const stageBuilder = stageSymbolTable.getStage(stage);
      const finalStage = new Stage(
        stageBuilder.getName(),
        stageBuilder.getJobs(),
        stageBuilder.getNeeds(),
        stageBuilder.getRunsOn()
      )
      this.semanticModel.addStage(finalStage);
    }

    this.semanticModel.setTargets(targets);
    this.semanticModel.setVariables(variables);
    this.semanticModel.setTrigger(trigger);

    return this.semanticModel;
  }
}

export default DSLParser;