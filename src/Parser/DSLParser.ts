import YAML from 'yaml';
import fs from 'fs';
import path from 'path';
import StageSymbolTable from './StageSymbolTable';
import StageBuilder from './StageBuilder';
import JobBuilder, { JobType } from './JobBuilder';
import Task from '../Common/Task';
import Run from '../SemanticModel/Tasks/Run';
import BuildDockerImage from './../SemanticModel/Tasks/BuildDockerImage';
import Job from '../Common/Job';
import Stage from '../Common/Stage';
import SemanticModel from '../Common/SemanticModel';

const inputFile = fs.readFileSync(path.join(__dirname, '../testdsl.yml'), 'utf8');

export default class DSLParser{

    parse(): SemanticModel {
      this.populateSymbolTable();
      return this.buildSemanticModel();
    }

    private populateSymbolTable() {
      const stageSymbolTable = StageSymbolTable.getInstance();
      const stages = YAML.parse(inputFile)['pipeline']['stages'];

      for(let stageObject of stages) {
        const stageBuilder = new StageBuilder();
        const stage = stageObject.stage;

        if (stage.name && stage.runs_on && stage.job) {
          stageBuilder.setName(stage.name);
          stageBuilder.setRunsOn(stage.runs_on);

          if (stage.needs) {
            for (let needs of stage.needs) {
              stageBuilder.addPredecessor(needs);
            }
          }
          
          for (let job of stage.job) {
            const jobBuilder = new JobBuilder();
            this.addTasksToJob(job, jobBuilder);

            stageBuilder.addJob(
              new Job(jobBuilder.getTasks())
            );
          }

        } else {
          throw new Error(`Stage is missing a name or runs_on property`);
        }

        stageSymbolTable.addStage(stageBuilder);
      }
    }

    private addTasksToJob(job: JobType, jobBuilder: JobBuilder) {
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
          stageBuilder.getPredecessors(),
          stageBuilder.getRunsOn()
        )

        semanticModel.addStage(finalStage);
      }

      return semanticModel;
    }
}