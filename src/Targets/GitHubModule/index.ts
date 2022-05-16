import YAML from 'yaml';
import Pipeline from '../../Common/Pipeline';
import fs from 'fs';
import path from 'path';
import { TargetPlatformGenerator } from '../../Common/TargetPlatformGenerator';
import BuildDockerImage from '../../SemanticModel/Tasks/BuildDockerImage';
import Checkout from '../../SemanticModel/Tasks/Checkout';
import { generateBuildDockerImageTask, generateCheckoutTask, generatePullDockerImageTask, generateRunTask } from './tasks';
import PullDockerImage from '../../SemanticModel/Tasks/PullDockerImage';
import Run from '../../SemanticModel/Tasks/Run';

export class GitHubConfigGenerator implements TargetPlatformGenerator {
  private pipeline: Pipeline;
  private configObject: any;
  
  constructor(pipeline: Pipeline) {
    this.pipeline = pipeline;
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

    const onObject: {
      push?: TriggerType,
      pull_request?: TriggerType
    } = {};

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
      for (var keys in obj) {
        //checking if the current value is an object itself
        if (typeof obj[keys] === 'object') {
          // if so then again calling the same function
          this.changeSecretsSyntax(obj[keys])
        } else {
          // else getting the value and replacing single { with {{ and so on
          const secrets: string[] = obj[keys].match(/\$\{(secrets\.)[a-zA-Z][^{}]+\}/gm);
          if (secrets) {
            for (let i = 0; i < secrets.length; i++) {
              let newValue = obj[keys].replace(
                secrets[i], "${{ " + secrets[i].replace("${", "").replace("}", "") + " }}"
                );
              obj[keys] = newValue;
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
      const stageId = this.generateStageId(stage.getName());
      stagesObject.jobs[stageId] = builtStage; 
    }

    Object.assign(this.configObject, stagesObject);
  }

  private generateStageId = (name: string): string => {
    const str = "" + name;
    return str.replace(' ', '_').toLowerCase();
  }
  
  private buildStage = (stage: any): StageObject => {
    const stageObject: StageObject = {
      'runs-on': stage.runs_on,
      steps: this.buildJobs(stage.jobs)
    };

    if (stage.needs.length > 0) {
      stageObject.needs = stage.needs;
    };

    return stageObject;
  }
  
  private buildJobs = (jobs: any) => {
    const resultArr: any[] = []
    for (let job of jobs) {
      const tasks = job.getTasks();

      for (let task of tasks) {
        resultArr.push(this.buildTask(task));
      }
    }
    return resultArr;
  }

  private buildTask = (task:any) => {
    if (task instanceof BuildDockerImage) {
      return generateBuildDockerImageTask(task);
    }
    
    if (task instanceof Checkout) {
      return generateCheckoutTask(task);
    }
    
    if (task instanceof PullDockerImage) {
      return  generatePullDockerImageTask(task);
    }
    
    if (task instanceof Run) {
      return generateRunTask(task);
    }
  }
}
