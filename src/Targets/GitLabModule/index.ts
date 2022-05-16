import YAML from 'yaml';
import Pipeline from '../../Common/Pipeline';
import { TargetPlatformGenerator } from './../../Common/TargetPlatformGenerator';
import fs from 'fs';
import path from 'path';
import Stage from '../../Common/Stage';
import BuildDockerImage from '../../SemanticModel/Tasks/BuildDockerImage';
import Checkout from '../../SemanticModel/Tasks/Checkout';
import PullDockerImage from '../../SemanticModel/Tasks/PullDockerImage';
import Run from '../../SemanticModel/Tasks/Run';
import { dockerSetup, generateBuildDockerImageTask, generatePullDockerImageTask, generateRunTask } from './tasks';
import { GitLabJobObject } from './types';

export class GitLabConfigGenerator implements TargetPlatformGenerator {
  private pipeline: Pipeline;
  private configObject: any;

  constructor(pipeline: Pipeline) { 
    this.pipeline = pipeline;
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
      const stage: Stage = this.pipeline.getStages()[i];
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
      for (var key in obj) {
        //checking if the current value is an object itself
        if (typeof obj[key] === 'object') {
          // if so then again calling the same function
          this.changeSecretsSyntax(obj[key])
        } else {
          // else getting the value and replacing single { with {{ and so on
          if (obj[key] !== undefined) {
          const secrets: string[] = obj[key].match(/\$\{(secrets\.)[a-zA-Z][^{}]+\}/gm);
          if (secrets) {
            for (let i = 0; i < secrets.length; i++) {
              let newValue = obj[key].replace(secrets[i], "$" + secrets[i].replace("${secrets.", "").replace("}", "") + "");
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
        const beforeTasks: any[] = [];
        const stage = stages[i];
        const stageKey = `${stage.getName()}-${this.sanitizeJobName(jobs[j].getName())}`;
        let tasksArray: any[] = [];
        let needsArray: string[] = [];

        needsArray = this.buildNeeds(needs);
        
        const jobObject:GitLabJobObject = {
          [stageKey]: {
            image: this.getSelectedImage(this.pipeline.getStages()[i]),
            stage: this.pipeline.getStages()[i].getName(),
            script: tasksArray,
            needs: needsArray
          }
        };
        
        tasksArray = this.buildTasks(stageKey, jobObject,tasks);

        Object.assign(this.configObject, jobObject);
      }
    }
  }

  private buildNeeds = (needs:any):string[] => {
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

  private buildTasks = (stageKey: string, jobObject:GitLabJobObject, tasks:any):any[] => {
    const tasksArray: any[] = [];

    for (let task of tasks) {
      if (task instanceof BuildDockerImage) {
        jobObject[stageKey].services = dockerSetup()
        tasksArray.push(...generateBuildDockerImageTask(task));
      }
      
      if (task instanceof Checkout) {
        console.log("Checkout should not be specified on GitLab")
      }
      
      if (task instanceof PullDockerImage) {
        tasksArray.push(...generatePullDockerImageTask(task));
      }

      if (task instanceof Run) {
        tasksArray.push(...generateRunTask(task));
      }
    }
    return tasksArray;
  }

  private sanitizeJobName = (name:string):string => {
    return name.replaceAll(' ','_')
  }

  private getSelectedImage(stage: Stage): string {
    return stage.getRunsOn();
  }

}
