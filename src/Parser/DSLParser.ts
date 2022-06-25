import YAML from 'yaml';
import fs from 'fs';
import path from 'path';
import StageSymbolTable from './StageSymbolTable';
import JobBuilder from './JobBuilder';
import IBuildDockerImageFactory from './../SemanticModel/Tasks/BuildDockerImage';
import Job, { JobSyntaxType, dockerBuildSyntax, checkoutSyntax } from '../SemanticModel/Job';
import StageFactory, { StageSyntaxType } from '../SemanticModel/Stage';
import { TargetsFactory } from './../SemanticModel/Targets';
import { Inject, Service } from 'typedi';
import { JobBuilderFactory } from './JobBuilderFactory';
import ITrigger from '../SemanticModel/interfaces/ITrigger';
import ITriggerFactory from '../SemanticModel/Trigger';
import RunFactory from '../SemanticModel/Tasks/Run';
import CheckoutFactory from '../SemanticModel/Tasks/Checkout';
import ITargets from '../SemanticModel/interfaces/ITargets';
import VariablesFactory from './../SemanticModel/Variables';
import IVariables from '../SemanticModel/interfaces/IVariables';
import IPipeline from '../SemanticModel/interfaces/IPipeline';
import Task from '../SemanticModel/interfaces/Task';
import IStage from '../SemanticModel/interfaces/IStage';

@Service({ id: 'dslparser' })
class DSLParser{
  private inputFileClone = "";
  private fileClonePath: string;
  private inputFilePath: string;

  @Inject('Pipeline') // @ts-ignore
  private pipeline: IPipeline;
  @Inject('JobBuilderFactory') // @ts-ignore
  private jobBuilderFactory: JobBuilderFactory;
  @Inject('TargetsFactory') // @ts-ignore
  private targetsFactory: TargetsFactory;
  @Inject('TriggerFactory') // @ts-ignore
  private triggerFactory: ITriggerFactory;
  @Inject('VariablesFactory') // @ts-ignore
  private variablesFactory: VariablesFactory;
  @Inject('StageFactory') // @ts-ignore
  private stageFactory: StageFactory;
  @Inject('BuildDockerImageFactory') // @ts-ignore
  private buildDockerImageFactory: IBuildDockerImageFactory;
  @Inject('RunFactory') // @ts-ignore
  private runFactory: RunFactory;
  @Inject('CheckoutFactory') //@ts-ignore
  private checkoutFactory: CheckoutFactory
  
  constructor(
    @Inject('dslparser.inputFileName') inputFileName: string,
  ) {
    this.inputFilePath = path.join(process.cwd(), inputFileName);
    const fileCloneName = '.singularci-copy.yml';
    this.fileClonePath = path.join(process.cwd(), fileCloneName);
  }

  private createTempFile = () => {
    if (!fs.existsSync(this.inputFilePath)) throw new Error(`Error: File was not found in the root of the project: ${this.inputFilePath}`);

    if (fs.existsSync(this.fileClonePath)) {
      fs.rmSync(this.fileClonePath);
    }
    
    fs.copyFileSync(this.inputFilePath, this.fileClonePath);
    
    this.inputFileClone = fs.readFileSync(this.fileClonePath, 'utf8');
  }

  parse(): IPipeline {
    this.createTempFile();
    this.validateYAMLStructure();    

    const variables = this.buildVariables();
    this.resolveVariables(variables);
    
    const targets = this.buildTargets();
    const triggers = this.buildTriggers();
    const stages = this.buildStages();

    this.buildSymbolTable(stages);

    return this.buildPipeline(targets, variables, triggers);
  }
  
  private validateYAMLStructure() {
    if (YAML.parse(this.inputFileClone)['pipeline'] == null) throw new Error('The keyword "pipeline" is missing');
    if (YAML.parse(this.inputFileClone)['pipeline']['targets'] == null) throw new Error('No targets defined');
    if (YAML.parse(this.inputFileClone)['pipeline']['triggers'] == null) throw new Error('No triggers defined');
    if (YAML.parse(this.inputFileClone)['pipeline']['stages'] == null) throw new Error('The keyword "stages" is missing');
    
  }

  private resolveVariables(variables: IVariables): void {
    for (const variable in variables.getVariables()) {
      this.inputFileClone = this.inputFileClone.replaceAll("${" + variable + "}", variables.getVariable(variable));
    }

    // The regex tests if there are any undeclared variables in the file, which are not platform specific secrets
    const undefinedVariables = this.inputFileClone.match(/\$\{(?!secrets\.)[a-zA-Z][^{}]+\}/gm);

    if (undefinedVariables != null) {
      throw new Error(`Error: The following variable(s) are used, but not declared: ${undefinedVariables}`);
    }
  }

  private buildTargets(): ITargets {
    try {
      const targetsArray = YAML.parse(this.inputFileClone)['pipeline']['targets']; 
      const targets = this.targetsFactory.createTargets();
      
      for (const target of targetsArray) {
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

      if (!triggersArray.trigger_types) throw new Error('No trigger types defined');
      if (!triggersArray.branches) throw new Error('No trigger branches defined');

      for (const triggerTypes of triggersArray.trigger_types) {
        triggers.addType(triggerTypes);
      }

      for (const triggerBranch of triggersArray.branches) {
        triggers.addBranch(triggerBranch);
      }
      
      return triggers;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  private buildVariables(): IVariables {
    try {
      const variables = this.variablesFactory.createVariables();

      if (YAML.parse(this.inputFileClone)['pipeline']['variables'] != null) { 
        const variablesArray = YAML.parse(this.inputFileClone)['pipeline']['variables'];
  
        if (variablesArray) {
          for (const variable of variablesArray) {
            variables.addVariable(variable.key, variable.value);
          }
        }
      }

      return variables;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  private buildStages(): IStage[]  {    
    try {
      const stages = YAML.parse(this.inputFileClone)['pipeline']['stages'];
      const stageList: IStage[] = [];

      for (const stageObject of stages) {
        stageList.push(this.buildStage(stageObject.stage));
      }

      return stageList;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  private buildSymbolTable(stages: IStage[]) {
    const stageSymbolTable = StageSymbolTable.getInstance();
    stageSymbolTable.reset();

    for (const stage of stages) { 
      stageSymbolTable.addStage(stage);
    }
  }

  private buildStage(stage: StageSyntaxType): IStage {
    try {
      if (!stage.name) throw new Error(`A stage is missing a name`);
      if (!stage.runs_on) throw new Error(`The stage ${stage.name} is missing a runs_on property`);
      if (!stage.jobs) throw new Error(`The stage ${stage.name} does not contain any jobs`);

      const needs = this.getNeedsFromStage(stage);
      const jobs = this.buildJobs(stage);

      return this.stageFactory.createStage(
        stage.name,
        jobs,
        needs,
        stage.runs_on
      )

    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  private getNeedsFromStage(stage: StageSyntaxType) {
    const needs: string[] = [];
    if (stage.needs) {
      for (const need of stage.needs) {
        needs.push(need);
      }
    }

    return needs;
  }

  private buildJobs(stage: StageSyntaxType) {
    const jobs: Job[] = [];

    for (const job of stage.jobs) {
      const jobBuilder = this.jobBuilderFactory.createJobBuilder();

      if (!job.name) throw new Error(`A job is missing a name`);

      jobBuilder.setName(job.name);
      this.addTasksToJob(job, jobBuilder);

      jobs.push(new Job(jobBuilder.getName(), jobBuilder.getTasks()));
    }

    return jobs;
  }

  private addTasksToJob(job: JobSyntaxType, jobBuilder: JobBuilder) {
    try {
      if (job.run) {
        if (!Array.isArray(job.run)) throw new Error(`The run property of job ${job.name} is not an array`);
        jobBuilder.addTask(this.generateRunTask(job.run));
      } 
      
      if (job.docker_build) { 
        jobBuilder.addTask(this.generateDockerBuildTask(job.docker_build));
      }
  
      if (job.checkout) {
        jobBuilder.addTask(this.generateCheckoutTask(job.checkout));
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  private generateRunTask(commands: string[]): Task {
    if (commands.length === 0) throw new Error(`A run task does not contain any commands`);
    if (!commands) throw new Error(`A run task is not valid`);

    const run = this.runFactory.createRunTask(commands);
    return run;
  }

  private generateDockerBuildTask(job: dockerBuildSyntax): Task {
    if (!job.image_name) throw new Error(`A docker build task is missing the property image_name`);
    if (!job.docker_file_path) throw new Error(`A docker build task is missing the property docker_file_path`);
    if (!job.user_name) throw new Error(`A docker build task is missing the property user_name`);
    if (!job.password) throw new Error(`A docker build task is missing the property password`);

    const docker_build = this.buildDockerImageFactory.createBuildDockerImageTask(
      job.image_name,
      job.docker_file_path,
      job.user_name,
      job.password  
    )
    return docker_build;
  }

  private generateCheckoutTask(job: checkoutSyntax): Task {
    if (!job.repo_url) throw new Error(`A checkout task is missing the property repo_url`);
    if (!job.repo_name) throw new Error(`A checkout task is missing the property repo_name`);

    const checkout = this.checkoutFactory.createCheckoutTask(
      job.repo_url,
      job.repo_name
    );
    return checkout;
  }

  private buildPipeline(targets: ITargets, variables: IVariables, trigger: ITrigger): IPipeline {
    const stageSymbolTable = StageSymbolTable.getInstance();
    
    this.pipeline.reset();

    for (const stage in stageSymbolTable.getStages()) {
      const stageBuilder = stageSymbolTable.getStage(stage);
      const finalStage = this.stageFactory.createStage(
        stageBuilder.getName(),
        stageBuilder.getJobs(),
        stageBuilder.getNeeds(),
        stageBuilder.getRunsOn(),
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