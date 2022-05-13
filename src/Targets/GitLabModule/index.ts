import YAML from 'yaml';
import SemanticModel from './../../Common/SemanticModel';
import { TargetPlatformGenerator } from './../../Common/TargetPlatformGenerator';
import fs from 'fs';
import path from 'path';
import Stage from '../../Common/Stage';
import BuildDockerImage from '../../SemanticModel/Tasks/BuildDockerImage';
import Checkout from '../../SemanticModel/Tasks/Checkout';
import PullDockerImage from '../../SemanticModel/Tasks/PullDockerImage';
import Run from '../../SemanticModel/Tasks/Run';
import { dockerSetup, generateBuildDockerImageTask, generatePullDockerImageTask, generateRunTask } from './tasks';

export class GitLabConfigGenerator implements TargetPlatformGenerator {
  private semanticModel: SemanticModel;
  private configObject: any;

  constructor(semanticModel: SemanticModel) { 
    this.semanticModel = semanticModel;
    this.configObject = {};
  }

  public generateConfig = () => {
    if (!this.shouldGenerate()) return;
    
    // console.log(YAML.stringify(this.configObject));
    // console.log(util.inspect(this.semanticModel, false, null, true /* enable colors */))

    this.buildSecrets();

    this.buildTriggers();
    this.buildStages();
    this.buildJobs();

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
    return this.semanticModel != undefined && this.semanticModel.getTargets().includes('GitLab');
  }

  private buildStages() {
    const stagesArray: string[] = [];
    for (let i = 0; i < this.semanticModel.getStages().length; i++) { 
      const stage: Stage = this.semanticModel.getStages()[i];
      stagesArray.push(stage.getName());
    }

    this.configObject.stages = stagesArray;
  }

  
  private buildTriggers() {
    const isPushSet = this.semanticModel.getTrigger().getTypes().includes('push');
    const isPullRequestSet = this.semanticModel.getTrigger().getTypes().includes('pull_request');

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
    this.semanticModel = this.changeValue(this.semanticModel);
  }

  private changeValue = (obj: any) => {
    if (typeof obj === 'object') {
      // iterating over the object using for..in
      for (var keys in obj) {
        //checking if the current value is an object itself
        if (typeof obj[keys] === 'object') {
          // if so then again calling the same function
          this.changeValue(obj[keys])
        } else {
          // else getting the value and replacing single { with {{ and so on
          const secrets: string[] = obj[keys].match(/\$\{(secrets\.)[a-zA-Z][^{}]+\}/gm);
          if (secrets) {
            for (let i = 0; i < secrets.length; i++) {
              let newValue = obj[keys].replace(secrets[i], "$" + secrets[i].replace("${secrets.", "").replace("}", "") + "");
              obj[keys] = newValue;
            }
          }
        }
      }
    }

    return obj;
  }

  buildJobs() {
    const stages = this.semanticModel.getStages();

    for (let i = 0; i < stages.length; i++) {
      const jobs = stages[i].getJobs();

      for (let j = 0; j < jobs.length; j++) {
        const tasks = jobs[j].getTasks();
        let tasksArray: any[] = [];
        const needsArray: string[] = [];
        const beforeTasks: any[] = [];
        
        const jobObject: { 
          [key: string]: {
            image: string,
            stage: string,
            script: string[],
            needs: string[],
            services?: string[],
            before_script?: string[]
          }
        } = {
          [`${stages[i].getName()}-job-${j + 1}`]: {
            image: this.getSelectedImage(this.semanticModel.getStages()[i]),
            stage: this.semanticModel.getStages()[i].getName(),
            script: tasksArray,
            needs: needsArray
          }
        };

        for (let k = 0; k < stages[i].getNeeds().length; k++) {
          const needsName: string = stages[i].getNeeds()[k];
          const neededStage = this.semanticModel.getStages().find(stage => stage.getName() === needsName);

          if (neededStage) { 
            const jobAmount = neededStage.getJobs().length;

            for (let l = 0; l < jobAmount; l++) {
              const jobName = `${neededStage.getName()}-job-${l + 1}`;
              needsArray.push(jobName);
            }
          }
        }

        for (let task of tasks) {
          if (task instanceof BuildDockerImage) {
            const stageKey = `${stages[i].getName()}-job-${j + 1}`;
            
            jobObject[stageKey].services = dockerSetup(stages[i], task)
            
            tasksArray.push(...generateBuildDockerImageTask(task));
          }
          
          if (task instanceof Checkout) {
            console.log("Checkout should not be specified on GitLab")
            //tasksArray.push(generateCheckoutTask(task));
          }
          
          if (task instanceof PullDockerImage) {
            tasksArray.push(...generatePullDockerImageTask(task));
          }

          if (task instanceof Run) {
            tasksArray.push(...generateRunTask(task));
          }
        }
      
        Object.assign(this.configObject, jobObject);
      }
    }
  }

  getSelectedImage(stage: Stage): string {
    const runsOn = stage.getRunsOn();

    if (runsOn === 'ubuntu-latest') {
      return 'ubuntu:latest';
    } else if (runsOn === 'windows-latest') {
      return 'windows:20H2';
    } else {
      throw new Error(`The specified image ${stage.getRunsOn()} does not exist`)
    }
  }

}
