import YAML from 'yaml';
import fs from 'fs';
import path from 'path';
import { TargetPlatformGenerator } from '../interfaces/TargetPlatformGenerator';
import BuildDockerImage from '../../SemanticModel/Tasks/BuildDockerImage';
import Checkout from '../../SemanticModel/Tasks/Checkout';
import { generateBuildDockerImageTask, generateCheckoutTask, generatePullDockerImageTask, generateRunTask } from './tasks';
import PullDockerImage from '../../SemanticModel/Tasks/PullDockerImage';
import Run from '../../SemanticModel/Tasks/Run';
import { GitHubTriggerObject, StageObject } from './types';
import { Inject, Service } from 'typedi';
import DSLParser from './../../Parser/DSLParser';
import IPipeline from '../../SemanticModel/interfaces/IPipeline';
import IStage from '../../SemanticModel/interfaces/IStage';

@Service({ id: "GitHubConfigGenerator" })
export class GitHubConfigGenerator implements TargetPlatformGenerator {
  private pipeline: IPipeline;
  private configObject: any;
  
  constructor(@Inject('dslparser') parser: DSLParser) {
    this.pipeline = parser.parse();
    this.configObject = {};
  }

  public generateConfig = () => {
    if (!this.shouldGenerate()) return;
    
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
      for (let key in obj) {
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
                let newValue = obj[key].replace(
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

    for (let stage of this.pipeline.getStages()) { 
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
    };

    return stageObject;
  }
  
  private buildJobs = (jobs: any) => {
    const resultArr: any[] = []
    for (let job of jobs) {
      const tasks = job.getTasks();

      for (let task of tasks) {
        if (task instanceof BuildDockerImage) {
          resultArr.push(...generateBuildDockerImageTask(task));
        }
        
        if (task instanceof Checkout) {
          resultArr.push(generateCheckoutTask(task));
        }
        
        if (task instanceof PullDockerImage) {
          resultArr.push(generatePullDockerImageTask(task));
        }
        
        if (task instanceof Run) {
          resultArr.push(generateRunTask(task));
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
