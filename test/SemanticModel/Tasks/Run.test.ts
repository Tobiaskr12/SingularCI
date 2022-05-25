import RunFactory from "../../../src/SemanticModel/Tasks/Run";
import { TaskType } from "../../../src/SemanticModel/Tasks/TaskEnum";


let runFactory: RunFactory

beforeEach(() => {
  runFactory = new RunFactory();
})

test('getCommands should be able to get the commands of a run', () => {
  const run = runFactory.createRunTask(["run", "node", "file.js"]);
  expect(run.getCommands()).toEqual(["run", "node", "file.js"]);
})

test('getType should be able to get the type on a run command', () => {
  const run = runFactory.createRunTask(["run"]);
  expect(!isNaN(run.getType())).toBe(true);
})

test('getType should be the type Run for a run command', () => {
  const run = runFactory.createRunTask(["run"]);
  expect(run.getType()).toBe(TaskType.Run);
})

