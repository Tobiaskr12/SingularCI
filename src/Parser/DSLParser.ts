import { dockerBuildSyntax, dockerPullSyntax } from './../Common/Job';
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
import Pipeline from '../Common/Pipeline';
import { TargetsFactory } from './../SemanticModel/Targets';
import { Inject, Service } from 'typedi';
import { JobBuilderFactory } from './JobBuilderFactory';
import PullDockerImage from '../SemanticModel/Tasks/PullDockerImage';
import Checkout from '../SemanticModel/Tasks/Checkout';
import ITrigger from '../SemanticModel/interfaces/ITrigger';
import { TriggerFactory } from '../SemanticModel/Trigger';
import ITargets from '../SemanticModel/interfaces/ITargets';
import VariablesFactory from './../SemanticModel/Variables';
import IVariables from '../SemanticModel/interfaces/IVariables';

@Service({ id: 'dslparser' })
class DSLParser{
  private inputFileClone;
  private fileClonePath;
  private pipeline;
  private jobBuilderFactory;
  private targetsFactory: TargetsFactory;
  private triggerFactory: TriggerFactory;
  private variablesFactory: VariablesFactory;

  constructor(
    @Inject('dslparser.inputFileName') inputFileName: string,
    @Inject('Pipeline') pipeline: Pipeline,
    @Inject('JobBuilderFactory') jobBuilderFactory: JobBuilderFactory,
    @Inject('TargetsFactory') targetsFactory: TargetsFactory,
    @Inject('TriggerFactory') triggerFactory: TriggerFactory,
    @Inject('VariablesFactory') variablesFactory: VariablesFactory
  ) {
    let inputFilePath = path.join(process.cwd(), inputFileName);
    let fileCloneName = '.singularci-copy.yml';
    this.fileClonePath = path.join(process.cwd(), fileCloneName);
    
    fs.copyFileSync(inputFilePath, this.fileClonePath);
    
    this.inputFileClone = fs.readFileSync(this.fileClonePath, 'utf8');
    this.pipeline = pipeline;
    this.jobBuilderFactory = jobBuilderFactory;
    this.targetsFactory = targetsFactory;
    this.triggerFactory = triggerFactory;
    this.variablesFactory = variablesFactory;
  }

  parse(): Pipeline {
    const variables = this.buildVariables();
    this.resolveVariables(variables);
    
    const targets = this.buildTargets();
    const triggers = this.buildTriggers();
    const stages = this.buildStages();;

    this.buildSymbolTable(stages);

    return this.buildPipeline(targets, variables, triggers);
  }

  private resolveVariables(variables: IVariables): void {
    for (let variable in variables.getVariables()) {
      this.inputFileClone = this.inputFileClone.replaceAll("${" + variable + "}", variables.getVariable(variable));
    }

    // The regex tests if there are any undeclared variables in the file, which are not platform specific secrets
    let undefinedVariables = this.inputFileClone.match(/\$\{(?!secrets\.)[a-zA-Z][^{}]+\}/gm);

    if (undefinedVariables != null) {
      throw new Error(`Error: The following variable(s) are used, but not declared: ${undefinedVariables}`);
    }
  }

  private buildTargets(): ITargets {
    try {
      const targetsArray = YAML.parse(this.inputFileClone)['pipeline']['targets']; 
      const targets = this.targetsFactory.createTargets();
      
      for (let target of targetsArray) {
        targets.addTarget(target);
      }

      return targets;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  private buildTriggers(): ITrigger {
    try {
      const triggersArray = YAML.parse(this.inputFileClone)['pipeline']['triggers'];
      const triggers = this.triggerFactory.createTrigger();

      for (let triggerTypes of triggersArray.trigger_types) {
        triggers.addType(triggerTypes);
      }

      for (let triggerBranch of triggersArray.branches) {
        triggers.addBranch(triggerBranch);
      }
      
      return triggers;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  private buildVariables(): IVariables {
    try {
      const variablesArray = YAML.parse(this.inputFileClone)['pipeline']['variables'];
      const variables = this.variablesFactory.createVariables();

      if (variablesArray) {
        for (let variable of variablesArray) {
          variables.addVariable(variable.key, variable.value);
        }
      }

      return variables;
    } catch (error: any) {
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
        this.buildJobs(stage, stageBuilder);
  
      } else {
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

  private buildJobs(stage: StageSyntaxType, stageBuilder: StageBuilder) {
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
      jobBuilder.addTask(this.createRunTask(job.run));
    } 
    
    if (job.docker_build) { 
      jobBuilder.addTask(this.createDockerBuildTask(job.docker_build));
    }

    if (job.docker_pull) { 
      jobBuilder.addTask(this.createDockerPullTask(job.docker_pull));
    }

    if (job.checkout) {
      jobBuilder.addTask(this.createCheckoutTask(job.checkout));
    }
  }

  private createRunTask(command: string[]): Run {
    const run = new Run(command);
    return run;
  }

  private createDockerBuildTask(job: dockerBuildSyntax): BuildDockerImage {
    const docker_build = new BuildDockerImage(
      job.image_name,
      job.docker_file_path,
      job.user_name,
      job.password  
    )
    return docker_build;
  }

  private createDockerPullTask(job: dockerPullSyntax): PullDockerImage {
    const docker_pull = new PullDockerImage(
      job.image_name,
      job.user_name,
      job.password
    )
    return docker_pull;
  }

  private createCheckoutTask(repo_url: string): Checkout {
    const checkout = new Checkout(repo_url);
    return checkout;
  }

  private buildPipeline(targets: ITargets, variables: IVariables, trigger: ITrigger): Pipeline {
    const stageSymbolTable = StageSymbolTable.getInstance();
    
    this.pipeline.reset();

    for (let stage in stageSymbolTable.getStages()) {
      const stageBuilder = stageSymbolTable.getStage(stage);
      const finalStage = new Stage(
        stageBuilder.getName(),
        stageBuilder.getJobs(),
        stageBuilder.getNeeds(),
        stageBuilder.getRunsOn()
      )
      this.pipeline.addStage(finalStage);
    }

    this.pipeline.setPlatformTargets(targets);
    this.pipeline.setVariables(variables);
    this.pipeline.setTrigger(trigger);

    return this.pipeline;
  }
}

export default DSLParser;