import IBuildDockerImage from '../../SemanticModel/interfaces/IBuildDockerImage';
import IRun from '../../SemanticModel/interfaces/IRun';

export const generateCheckoutTask = () => {
  const commandArray: string[] = [];
  commandArray.push('echo "Checkout task not supported for GitLab"');
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
