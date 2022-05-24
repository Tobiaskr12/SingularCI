
import IBuildDockerImage from '../../SemanticModel/interfaces/IBuildDockerImage';
import ICheckout from '../../SemanticModel/interfaces/ICheckout';
import IRun from '../../SemanticModel/interfaces/IRun';
import IStage from '../../SemanticModel/interfaces/IStage';

export const generateCheckoutTask = (task: ICheckout) => {
  const commandArray: string[] = [];
  commandArray.push('echo "Checkout task not supported for GitLab"');
  return commandArray;
}

export const generateRunTask = (task: IRun) => {
  return task.getCommands();
}

export const dockerSetup = (stage?: IStage, task?: IBuildDockerImage) => {
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
