import IBuildDockerImage from "../../../src/SemanticModel/interfaces/IBuildDockerImage";
import { BuildDockerImageFactory } from "../../../src/SemanticModel/Tasks/BuildDockerImage";
import { TaskType } from "../../../src/SemanticModel/Tasks/TaskEnum";

let buildDockerImage: IBuildDockerImage;
const imageName = "testImageName";
const buildFilePath = "testBuildFilePath";
const userName = "testUserName";
const password = "testPassword";

beforeEach(() => {
  const buildDockerImageFactory: BuildDockerImageFactory = new BuildDockerImageFactory();
  buildDockerImage = buildDockerImageFactory.createBuildDockerImageTask(
    imageName,
    buildFilePath,
    userName,
    password,
  );
});

test('getImageName should be able to get the image name', () => {
  expect(buildDockerImage.getImageName()).toBe(imageName);
});

test('getBuildFilePath should be able to get the build file path', () => {
  expect(buildDockerImage.getBuildFilePath()).toBe(buildFilePath);
});

test('getUserName should be able to get the user name', () => {
  expect(buildDockerImage.getUserName()).toBe(userName);
});

test('getPassword should be able to get the password', () => {
  expect(buildDockerImage.getPassword()).toBe(password);
});

test('getType should be able to get the correct task type', () => {
  const localBuildDockerImage = new BuildDockerImageFactory().createBuildDockerImageTask("", "", "", "");
  expect(localBuildDockerImage.getType()).toBe(TaskType.BuildDockerImage);
});