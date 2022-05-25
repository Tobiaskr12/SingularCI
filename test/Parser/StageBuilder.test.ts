import StageBuilder from "../../src/Parser/StageBuilder";
import Job from "../../src/SemanticModel/Job";

let stageBuilder: StageBuilder;
let job: Job;

beforeEach(() => {
  stageBuilder = new StageBuilder();
  job = new Job("Job1",[]);

})

test('SetName should update the name of a stage', () => {
  expect(stageBuilder.getName()).toBe('');
  stageBuilder.setName('Stage 1');
  expect(stageBuilder.getName()).toBe('Stage 1');
})

test('AddJob should add a job to the stage', () => {
  expect(stageBuilder.getJobs().length).toBe(0);
  stageBuilder.addJob(job);
  expect(stageBuilder.getJobs().length).toBe(1);
})

test('AddNeeds should add a stage dependency to a stage',() => {
  expect(stageBuilder.getNeeds().length).toBe(0);
  stageBuilder.addNeeds('Stage 2');
  expect(stageBuilder.getNeeds().length).toBe(1);
})

test('SetRunsOn should add a runs-on environment to the stage', () => {
  expect(stageBuilder.getRunsOn()).toBe('');
  stageBuilder.setRunsOn('Ubuntu-latest');
  expect(stageBuilder.getRunsOn()).toBe('Ubuntu-latest');
})


