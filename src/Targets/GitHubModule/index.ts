import YAML from 'yaml';
import SemanticModel from './../../Common/SemanticModel';
import fs from 'fs';
import path from 'path';
import { TargetPlatformGenerator } from '../../Common/TargetPlatformGenerator';
import util from 'util';

export class GitHubConfigGenerator implements TargetPlatformGenerator {
  private semanticModel: SemanticModel;
  private configObject: any;
  
  constructor(semanticModel: SemanticModel) {
    this.semanticModel = semanticModel;
    this.configObject = {};
  }

  public generateConfig = () => {
    if (!this.shouldGenerate()) return;
    
    // Generate Folders and files
    this.createFolderStructure();
    this.buildSecrets();

    this.buildTriggers();
    this.buildStages();
    this.buildJobs();
    
    console.log(YAML.stringify(this.configObject));
    console.log(util.inspect(this.semanticModel, false, null, true /* enable colors */))

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
    return this.semanticModel != undefined && this.semanticModel.getTargets().includes('GitHub');
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
    const isPushSet = this.semanticModel.getTrigger().types.includes('push');
    const isPullRequestSet = this.semanticModel.getTrigger().types.includes('pull_request');

    type TriggerType = {
      branches: string[]
    }

    const onObject: {
      push?: TriggerType,
      pull_request?: TriggerType
    } = {};

    const triggerObject = {
      on: onObject
    };

    if (isPushSet) {
      const pushObject = {
          branches: [...this.semanticModel.getTrigger().branches]
      };

      triggerObject.on.push = pushObject;
    }

    if (isPullRequestSet) {
      const pullRequestObject = {
          branches: [...this.semanticModel.getTrigger().branches]
      };

      triggerObject.on.pull_request = pullRequestObject;
    }

    this.configObject = triggerObject;
  }

  private buildSecrets = () => {  
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
              let newValue = obj[keys].replace(secrets[i], "${{ " + secrets[i].replace("${", "").replace("}", "") + " }}");
              obj[keys] = newValue;
            }
          }
        }
      }
    }

    return obj;
  }
  
  private buildStages = () => {
    
  }
  
  private buildJobs = () => {
    
  }
}
