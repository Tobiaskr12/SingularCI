import IStage from "../../src/SemanticModel/interfaces/IStage";
import StageFactory from "../../src/SemanticModel/Stage";
import Job from "../../src/SemanticModel/Job"
import RunFactory from "../../src/SemanticModel/Tasks/Run";
import CheckoutFactory from "../../src/SemanticModel/Tasks/Checkout";
import Task from "../../src/SemanticModel/interfaces/Task"

let stage: IStage;
let job: Job;
let jobName:string;
let stageFactory: StageFactory;
let runFactory: RunFactory;
let checkoutFactory: CheckoutFactory;
let stageName:string;
let environment:string;
let task1:Task;
let task2:Task;

beforeAll(() => {
  stageName = "Test_Stage";
  jobName = "job1"
  environment = "Ubuntu-latest"
  
  stageFactory = new StageFactory();
  runFactory = new RunFactory();
  checkoutFactory = new CheckoutFactory();

  task1 = runFactory.createRunTask(['echo "This is a test task"']);
  task2 = checkoutFactory.createCheckoutTask('fake-repo.remote.git');
  job = new Job(jobName, [task1, task2]);

  stage = stageFactory.createStage(stageName,[job],[],environment)
})

it('should be possible to get the name of a job', () => {
  expect(stage.getName()).toEqual(stageName);
})

it('should be possible to get the jobs on a stage', () => {
  expect(stage.getJobs()).toContainEqual(job)
})

it('should be possible to get the name of a job on a stage', () => {
  expect(stage.getJobs()[0].getName()).toEqual(jobName)
})

it('should be possible to get the task of a job on a stage', () => {
  expect(stage.getJobs()[0].getTasks()).toContain(task1)
  expect(stage.getJobs()[0].getTasks()).toContain(task2)
})

it('should be possible to get the runs-on environment on a stage', () => {
  expect(stage.getRunsOn()).toEqual(environment);
})

it('should be possible to get the needs on a stage', () => {
  expect(stage.getNeeds()).toHaveLength(0);
})
