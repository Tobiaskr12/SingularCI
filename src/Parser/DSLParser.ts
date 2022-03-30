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

const inputFile = fs.readFileSync(path.join(__dirname, '../testdsl.yml'), 'utf8');

export default class DSLParser{

    parse(): SemanticModel {
      const stages = this.buildStages();
      this.buildSymbolTable(stages);

      return this.buildSemanticModel();
    }

    private buildStages(): StageBuilder[]  {
      try {
        const stages = YAML.parse(inputFile)['pipeline']['stages'];
        const stageList: StageBuilder[] = [];

        for (let stageObject of stages) {
          stageList.push(this.buildStage(stageObject.stage))
        }

        return stageList;
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
    
    private buildSymbolTable(stages: StageBuilder[]) {
      const stageSymbolTable = StageSymbolTable.getInstance();

      for (let stage of stages) { 
        stageSymbolTable.addStage(stage);
      }
    }

    private buildStage(stage: StageSyntaxType): StageBuilder {
      const stageBuilder = new StageBuilder();

      if (stage.name && stage.runs_on && stage.job) {
        stageBuilder.setName(stage.name);
        stageBuilder.setRunsOn(stage.runs_on);
      
        this.addNeedsToStage(stage, stageBuilder);
        this.populateJobs(stage, stageBuilder);

      } else {
        throw new Error(`Stage is missing a name or runs_on property`);
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
      for (let job of stage.job) {
        const jobBuilder = new JobBuilder();
        this.addTasksToJob(job, jobBuilder);

        stageBuilder.addJob(
          new Job(jobBuilder.getTasks())
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
          job.docker_build.docker_file_path
        )
        jobBuilder.addTask(docker_build);
      }
    }

    private buildSemanticModel(): SemanticModel {
      const stageSymbolTable = StageSymbolTable.getInstance();
      const semanticModel = new SemanticModel();

      for (let stage in stageSymbolTable.getStages()) {
        const stageBuilder = stageSymbolTable.getStage(stage);
        const finalStage = new Stage(
          stageBuilder.getName(),
          stageBuilder.getJobs(),
          stageBuilder.getNeeds(),
          stageBuilder.getRunsOn()
        )

        semanticModel.addStage(finalStage);
      }

      return semanticModel;
    }
}