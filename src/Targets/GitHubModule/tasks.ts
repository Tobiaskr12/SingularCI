import Checkout from './../../SemanticModel/Tasks/Checkout';
import BuildDockerImage from './../../SemanticModel/Tasks/BuildDockerImage';
import PullDockerImage from '../../SemanticModel/Tasks/PullDockerImage';
import Run from '../../SemanticModel/Tasks/Run';

export const generateCheckoutTask = (task: Checkout) => {
  return {
    uses: '@actions/checkout@v3',
    with: {
      repository: task.getRepositoryURL()
    }
  }
}

export const generateRunTask = (task: Run) => {
  return {
    run: task.getCommand()
  }
}

export const generateBuildDockerImageTask = (task: BuildDockerImage) => {
  return {
    name: task.getName(),
    uses: "djbender/docker-buildx-pull-or-build@v0.5",
    with: {
      docker_username: task.getUserName(),
      docker_password: task.getPassword(),
      dockerfile: task.getBuildFilePath(),
      image: task.getImageName()
    }
  } 
}

export const generatePullDockerImageTask = (task: PullDockerImage) => { 
  return {
    name: task.getName(),
    uses: "djbender/docker-buildx-pull-or-build@v0.5",
    with: {
      docker_username: task.getUserName(),
      docker_password: task.getPassword(),
      dockerfile: "",
      image: task.getImageName()
    }
  }
}