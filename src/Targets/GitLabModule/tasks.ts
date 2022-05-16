import Checkout from './../../SemanticModel/Tasks/Checkout';
import BuildDockerImage from './../../SemanticModel/Tasks/BuildDockerImage';
import PullDockerImage from '../../SemanticModel/Tasks/PullDockerImage';
import Run from '../../SemanticModel/Tasks/Run';
import Stage from '../../Common/Stage';

export const generateCheckoutTask = (task: Checkout) => {
  return;
}

export const generateRunTask = (task: Run) => {
  return task.getCommands();
}

export const dockerSetup = (stage?: Stage, task?: BuildDockerImage) => {
  const resultArray: string[] = [];

  resultArray.push("docker:dind")
  return resultArray;
}

export const generateBuildDockerImageTask = (task: BuildDockerImage) => {
  const commandArray: string[] = [];

  commandArray.push(`docker login -u ${task.getUserName()} -p ${task.getPassword()}`);
  commandArray.push(`docker build -t ${task.getImageName()} ${task.getBuildFilePath()}`);
  commandArray.push(`docker push ${task.getUserName()}/${task.getImageName()}`);
  
  return commandArray;
}

export const generatePullDockerImageTask = (task: PullDockerImage) => {
  const commandArray: string[] = [];
  commandArray.push(`docker login -u ${task.getUserName()} -p ${task.getPassword()}`);
  commandArray.push(`docker pull ${task.getImageName()}` )
  return commandArray;
}