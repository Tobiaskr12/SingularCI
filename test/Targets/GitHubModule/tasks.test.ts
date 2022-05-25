import { BuildDockerImageFactory } from "../../../src/SemanticModel/Tasks/BuildDockerImage";
import CheckoutFactory from "../../../src/SemanticModel/Tasks/Checkout";
import RunFactory from "../../../src/SemanticModel/Tasks/Run";
import { generateBuildDockerImageTask, generateCheckoutTask, generateRunTask } from "../../../src/Targets/GitHubModule/tasks";

test('generate checkout task', () => {
  const repoUrl = 'fake-repo.remote.git';
  const repoName = 'FakeName';

  const task = new CheckoutFactory().createCheckoutTask(repoUrl, repoName);
  const generatedTask = generateCheckoutTask(task);

  expect(generatedTask.run).toEqual(
    `git clone ${task.getRepositoryURL()}`
  )
});

test('generate run task', () => {
  const task = new RunFactory().createRunTask(['echo "This is a test task"']);
  const generatedTask = generateRunTask(task);

  expect(generatedTask.run).toBe('echo "This is a test task"');
});

test('generate docker build task', () => {
  const task = new BuildDockerImageFactory().createBuildDockerImageTask(
    'fake-imagename',
    'test-path',
    'test-username',
    'test-password'
  );

  const generatedTask = generateBuildDockerImageTask(task);

  expect(generatedTask[0].name).toBe('Set up QEMU');
  expect(generatedTask[0].uses).toBe('docker/setup-qemu-action@v2');

  expect(generatedTask[1].name).toBe('Set up Docker Buildx');
  expect(generatedTask[1].uses).toBe('docker/setup-buildx-action@v2');

  expect(generatedTask[2].name).toBe('Login to DockerHub');
  expect(generatedTask[2].uses).toBe('docker/login-action@v2');
  if (generatedTask[2].with) { 
    expect(generatedTask[2].with.username).toBe('test-username');
    expect(generatedTask[2].with.password).toBe('test-password');
  } else {
    fail('with is not defined');
  }

  expect(generatedTask[3].name).toBe('Build and push');
  expect(generatedTask[3].uses).toBe('docker/build-push-action@v3');
  if (generatedTask[3].with) {
    expect(generatedTask[3].with.push).toBe(true);
    expect(generatedTask[3].with.tags).toBe('test-username/fake-imagename:latest');
  } else {
    fail('with is not defined');
  }
});
