import YAML from 'yaml';
import { TargetPlatformGenerator } from '../interfaces/TargetPlatformGenerator';
import fs from 'fs';
import path from 'path';
import { dockerSetup, generateBuildDockerImageTask, generateCheckoutTask, generateRunTask } from './tasks';
import { GitLabJobObject } from './types';
import { Inject, Service } from 'typedi';
import DSLParser from './../../Parser/DSLParser';
import IPipeline from './../../SemanticModel/interfaces/IPipeline';
import IStage from '../../SemanticModel/interfaces/IStage';
import { TaskType } from '../../SemanticModel/Tasks/TaskEnum';
import ICheckout from './../../SemanticModel/interfaces/ICheckout';

@Service({ id: "GitLabConfigGenerator" })
export class GitLabConfigGenerator implements TargetPlatformGenerator {
  private pipeline: IPipeline;
  private configObject: any;

  constructor(@Inject("dslparser") parser: DSLParser) { 
    this.pipeline = parser.parse();
    this.configObject = {};
  }

  public generateConfig = () => {
    if (!this.shouldGenerate()) return;

    this.buildSecrets();
    this.buildTriggers();

    this.buildStages();
    this.buildJobs();

    this.writeToFile();
  }

  private writeToFile = () => {
    fs.writeFileSync(
      path.join(
        process.cwd(),
        ".gitlab-ci.yml"
      ),
      YAML.stringify(this.configObject),
      "utf-8"
    );
  }

  private shouldGenerate(): boolean {
    return this.pipeline != undefined && this.pipeline.getPlatformTargets().getTargets().includes('GitLab');
  }

  private buildStages() {
    const stagesArray: string[] = [];
    for (let i = 0; i < this.pipeline.getStages().length; i++) { 
      const stage: IStage = this.pipeline.getStages()[i];
      stagesArray.push(stage.getName());
    }

    this.configObject.stages = stagesArray;
  }

  
  private buildTriggers() {
    const isPushSet = this.pipeline.getTrigger().getTypes().includes('push');
    const isPullRequestSet = this.pipeline.getTrigger().getTypes().includes('pull_request');

    const rulesObject: [{
      if: string,
      when: string
    }?] = [];

    const triggerObject = {
      workflow: {
        rules: rulesObject
      }
    };

    if (isPushSet) {
      triggerObject.workflow.rules.push(
        {
          if: '$CI_PIPELINE_SOURCE == "push"',
          when: 'always'
        }
      );
    }
    
    if (isPullRequestSet) {
      triggerObject.workflow.rules.push(
        {
          if: '$CI_PIPELINE_SOURCE == "merge_request_event"',
          when: 'always'
        }
      )
      
    }

    Object.assign(this.configObject, triggerObject);
  }
  
  private buildSecrets() {
    this.pipeline = this.changeSecretsSyntax(this.pipeline);
  }

  private changeSecretsSyntax = (obj: any) => {
    if (typeof obj === 'object') {
      // iterating over the object using for..in
      for (const key in obj) {
        //checking if the current value is an object itself
        if (typeof obj[key] === 'object') {
          // if so then again calling the same function
          this.changeSecretsSyntax(obj[key])
        } else {
          // else getting the value and replacing single { with {{ and so on
          if (obj[key] !== undefined && isNaN(obj[key])) {
          const secrets: string[] = obj[key].match(/\$\{(secrets\.)[a-zA-Z][^{}]+\}/gm);
          if (secrets) {
            for (let i = 0; i < secrets.length; i++) {
              const newValue = obj[key].replace(secrets[i], "$" + secrets[i].replace("${secrets.", "").replace("}", "") + "");
              obj[key] = newValue;
            }
          }
        }
        }
      }
    }
    return obj;
  }

  private buildJobs() {
    const stages = this.pipeline.getStages();

    for (let i = 0; i < stages.length; i++) {
      const jobs = stages[i].getJobs();

      for (let j = 0; j < jobs.length; j++) {
        const tasks = jobs[j].getTasks();
        const needs = stages[i].getNeeds();
        const stage = stages[i];
        const stageKey = `${stage.getName()}-${this.sanitizeJobName(jobs[j].getName())}`;
        const tasksArray: any[] = [];
        const needsArray: string[] = [];
        const beforeScriptArray: string[] = [];
        
        const jobObject:GitLabJobObject = {
          [stageKey]: {
            image: this.getSelectedImage(this.pipeline.getStages()[i]),
            stage: this.pipeline.getStages()[i].getName(),
            needs: needsArray,
            before_script: beforeScriptArray,
            script: tasksArray,
          }
        };
        
        beforeScriptArray.push(...this.buildBeforeScript(tasks));
        tasksArray.push(...this.buildTasks(stageKey, jobObject, tasks));   
        needsArray.push(...this.buildNeeds(needs));
        
        Object.assign(this.configObject, jobObject);
      }
    }
  }

  private buildNeeds = (needs:any): string[] => {
    const needsArray: string[] = [];

    for (let k = 0; k < needs.length; k++) {

      const needsName: string = needs[k];
      const neededStage = this.pipeline.getStages().find(stage => stage.getName() === needsName);

      if (neededStage) { 
        const jobs = neededStage.getJobs();
        const jobAmount = jobs.length;

        for (let l = 0; l < jobAmount; l++) {
          const jobName = `${neededStage.getName()}-${this.sanitizeJobName(jobs[l].getName())}`;
          needsArray.push(jobName);
        }
      }
    }
    return needsArray;
  }

  private buildBeforeScript = (tasks: any) => {
    const beforeScriptArray: string[] = [];
    
    for (const task of tasks) {
      if (task.getType() === TaskType.Checkout) {
        beforeScriptArray.push(...generateCheckoutTask(task));
      }
    }

    return beforeScriptArray;
  }

  private buildTasks = (stageKey: string, jobObject:GitLabJobObject, tasks:any):any[] => {
    const tasksArray: any[] = [];

    for (const task of tasks) {
      if (task.getType() === TaskType.BuildDockerImage) {
        jobObject[stageKey].image = "docker:latest";
        jobObject[stageKey].services = dockerSetup()
        tasksArray.push(...generateBuildDockerImageTask(task));
      }

      if (task.getType() === TaskType.Run) {
        tasksArray.push(...generateRunTask(task));
      }
    }
    return tasksArray;
  }

  private sanitizeJobName = (name:string):string => {
    return name.replaceAll(' ','_')
  }

  private getSelectedImage(stage: IStage): string {
    const runsOn = stage.getRunsOn();

    switch (runsOn) {
      case "ubuntu-latest":
        return "ubuntu:latest";
      case "windows-latest":
        return "mcr.microsoft.com/windows:20H2";
      default:
        return runsOn;
    }
  }

}
