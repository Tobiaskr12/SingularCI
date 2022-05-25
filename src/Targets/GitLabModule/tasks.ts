import IBuildDockerImage from '../../SemanticModel/interfaces/IBuildDockerImage';
import IRun from '../../SemanticModel/interfaces/IRun';
import ICheckout from './../../SemanticModel/interfaces/ICheckout';

export const generateCheckoutTask = (task: any) => {
  const commandArray: string[] = [];

  commandArray.push(`git clone ${task.getRepositoryURL()}`);
  commandArray.push(`cd ${task.getRepositoryName()}`);

  return commandArray;
}

export const generateRunTask = (task: IRun) => {
  return task.getCommands();
}

export const dockerSetup = () => {
  const resultArray: string[] = [];

  resultArray.push("docker:dind")
  return resultArray;
}

export const generateBuildDockerImageTask = (task: IBuildDockerImage) => {
  const commandArray: string[] = [];

  commandArray.push(`docker login -u ${task.getUserName()} -p ${task.getPassword()}`);
  commandArray.push(`docker build --pull -t "${task.getUserName()}/${task.getImageName()}" ${task.getBuildFilePath()}`);
  commandArray.push(`docker push "${task.getUserName()}/${task.getImageName()}"`);
  
  return commandArray;
}
