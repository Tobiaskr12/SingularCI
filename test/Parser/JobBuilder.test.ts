import JobBuilder from "../../src/Parser/JobBuilder"
import RunFactory from "../../src/SemanticModel/Tasks/Run";

let jobBuilder: JobBuilder;

beforeEach(() => {
  jobBuilder = new JobBuilder();
});

test('calling setName should update the name of a job', () => {
  const newName = "newName";
  expect(jobBuilder.getName()).toEqual("");
  jobBuilder.setName(newName);
  expect(jobBuilder.getName()).toEqual(newName);
});

test('calling addTask should add a task to a job', () => {
  const runFactory = new RunFactory();
  const task = runFactory.createRunTask(['echo "Test task"']);
  
  expect(jobBuilder.getTasks().length).toEqual(0);
  jobBuilder.addTask(task);
  expect(jobBuilder.getTasks().length).toEqual(1);
});