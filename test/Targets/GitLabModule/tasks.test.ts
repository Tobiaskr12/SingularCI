import { BuildDockerImageFactory } from "../../../src/SemanticModel/Tasks/BuildDockerImage";
import CheckoutFactory from "../../../src/SemanticModel/Tasks/Checkout";
import RunFactory from "../../../src/SemanticModel/Tasks/Run";
import { generateBuildDockerImageTask, generateCheckoutTask, generateRunTask } from "../../../src/Targets/GitLabModule/tasks";
import { dockerSetup } from './../../../src/Targets/GitLabModule/tasks';

test('generate checkout task', () => {
  const repoURL = "fake.repo-name.git";
  const repoName = "FakeRepo"

  const checkoutFactory = new CheckoutFactory();
  const task = checkoutFactory.createCheckoutTask(repoURL, repoName);
  const generatedTask = generateCheckoutTask(task);

  expect(generatedTask).toEqual([`git clone ${repoURL}`, `cd ${repoName}`]);
});

test('generate run task', () => { 
  const task = new RunFactory().createRunTask(['echo "This is a test task"']);
  const generatedTask = generateRunTask(task);

  expect(generatedTask).toEqual(['echo "This is a test task"']);
});

test('docker setup', () => { 
  const service = dockerSetup();
  expect(service).toEqual(['docker:dind']);
});

test('generate build docker image task', () => {
  const task = new BuildDockerImageFactory().createBuildDockerImageTask(
    'fake-imagename',
    'test-path',
    'test-username',
    'test-password'
  );

  const generatedTask = generateBuildDockerImageTask(task);

  expect(generatedTask[0]).toEqual(`docker login -u ${task.getUserName()} -p ${task.getPassword()}`);
  expect(generatedTask[1]).toEqual(`docker build --pull -t "${task.getUserName()}/${task.getImageName()}" ${task.getBuildFilePath()}`);
  expect(generatedTask[2]).toEqual(`docker push "${task.getUserName()}/${task.getImageName()}"`);
});