import YAML from 'yaml';
import fs from 'fs';
import path from 'path';
import { TargetPlatformGenerator } from '../interfaces/TargetPlatformGenerator';
import { generateBuildDockerImageTask, generateCheckoutTask, generateRunTask } from './tasks';
import { GitHubTriggerObject, StageObject } from './types';
import { Inject, Service } from 'typedi';
import DSLParser from './../../Parser/DSLParser';
import IPipeline from '../../SemanticModel/interfaces/IPipeline';
import IStage from '../../SemanticModel/interfaces/IStage';
import { TaskType } from '../../SemanticModel/Tasks/TaskEnum';
import Task from '../../SemanticModel/interfaces/Task';
import ICheckout from '../../SemanticModel/interfaces/ICheckout';

@Service({ id: "GitHubConfigGenerator" })
export class GitHubConfigGenerator implements TargetPlatformGenerator {
  private pipeline: IPipeline;
  private configObject: any;
  private parser: DSLParser;
  
  constructor(@Inject('dslparser') parser: DSLParser) {
    this.parser = parser;
    this.pipeline = parser.parse();
    this.configObject = {};
  }

  public generateConfig = () => {
    if (!this.shouldGenerate()) return;
    this.pipeline = this.parser.parse();
    
    // Generate Folders and files
    this.createFolderStructure();
    this.buildSecrets();

    this.buildTriggers();
    this.buildStages();

    this.writeToFile()
  }

  private writeToFile = () => {
    fs.writeFileSync(
      path.join(
        process.cwd(),
        ".github/workflows/workflow.yml"
      ),
      YAML.stringify(this.configObject),
      "utf-8"
    );
  }
  
  private shouldGenerate(): boolean {
    return this.pipeline != undefined && this.pipeline.getPlatformTargets().getTargets().includes('GitHub');
  }
  
  private createFolderStructure = () => {
    if (fs.existsSync(path.join(process.cwd(), ".github"))){
      fs.rmSync(path.join(process.cwd(), ".github"),{ recursive: true});
    }

    fs.mkdirSync(path.join(process.cwd(), ".github"));
    fs.mkdirSync(path.join(process.cwd(), ".github/workflows"));
    fs.writeFileSync(path.join(process.cwd(), ".github/workflows/workflow.yml"), "", "utf-8");
  }
  
  private buildTriggers = () => {
    const isPushSet = this.pipeline.getTrigger().getTypes().includes('push');
    const isPullRequestSet = this.pipeline.getTrigger().getTypes().includes('pull_request');

    const onObject:GitHubTriggerObject = {};

    const triggerObject = {
      on: onObject
    };

    if (isPushSet) {
      const pushObject = {
          branches: [...this.pipeline.getTrigger().getBranches()]
      };

      triggerObject.on.push = pushObject;
    }

    if (isPullRequestSet) {
      const pullRequestObject = {
          branches: [...this.pipeline.getTrigger().getBranches()]
      };

      triggerObject.on.pull_request = pullRequestObject;
    }

    Object.assign(this.configObject, triggerObject);
  }

  private buildSecrets = () => {  
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
                const newValue = obj[key].replace(
                  secrets[i], "${{ " + secrets[i].replace("${", "").replace("}", "") + " }}"
                  );
                obj[key] = newValue;
              }
            }
          }
        }
      }
    }

    return obj;
  }
  
  private buildStages = () => {
    const StagesArray: any = {};

    const stagesObject = {
      jobs: StagesArray
    };

    for (const stage of this.pipeline.getStages()) { 
      const builtStage = this.buildStage(stage);
      const stageId = this.generateStageId(this.sanitizeJobName(stage.getName()));
      stagesObject.jobs[stageId] = builtStage; 
    }

    Object.assign(this.configObject, stagesObject);
  }

  private generateStageId = (name: string): string => {
    const str = "" + name;
    return str.replace(' ', '_').toLowerCase();
  }
  
  private buildStage = (stage: IStage): StageObject => {

    const stageObject: StageObject = {
      steps: this.buildJobs(stage.getJobs())
    }

    Object.assign(stageObject, this.setRuntimeContainer(stage));
    
    if (stage.getNeeds().length > 0) {
      stageObject.needs = stage.getNeeds();
    }

    return stageObject;
  }
  
  private buildJobs = (jobs: any) => {
    const resultArr: any[] = []
    for (const job of jobs) {
      const tasks = job.getTasks();

      const checkoutTasks = tasks.filter((task: Task & ICheckout) => task.getType() === TaskType.Checkout);
      let checkoutRepoName = "";

      if (checkoutTasks.length > 1) { 
        throw new Error("Only one checkout is allowed per job");
      } 

      if (checkoutTasks.length === 1) { 
        checkoutRepoName = checkoutTasks[0].getRepositoryName();
      }

      for (const task of tasks) {
        const tempTasks = [];

        if (task.getType() === TaskType.BuildDockerImage) {
          tempTasks.push(...generateBuildDockerImageTask(task));
        }
        
        if (task.getType() === TaskType.Checkout) {
          tempTasks.push(generateCheckoutTask(task));
        }
        
        if (task.getType() === TaskType.Run) {
          const tempObj = generateRunTask(task);

          if (checkoutRepoName) {
            // @ts-ignore
            tempObj["working-directory"]= checkoutRepoName;
          }

          tempTasks.push(tempObj);
        }

        if (task.getType() === TaskType.Checkout) { 
          resultArr.unshift(...tempTasks);
        } else {
          resultArr.push(...tempTasks);
        }
      }
    }
    return resultArr;
  }

  private setRuntimeContainer = (stage: IStage) => {
    const runsOn = stage.getRunsOn();
    
    if (runsOn != "ubuntu-latest" && runsOn != "windows-latest") {
      return { 'runs-on': "ubuntu-latest", 'container': runsOn }
    }

    return { 'runs-on': runsOn };
  }

  private sanitizeJobName = (name:string):string => {
    return name.replaceAll(' ','_')
  }
}
