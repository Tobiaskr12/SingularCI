import Checkout from './../../SemanticModel/Tasks/Checkout';
import BuildDockerImage from './../../SemanticModel/Tasks/BuildDockerImage';
import PullDockerImage from '../../SemanticModel/Tasks/PullDockerImage';
import Run from '../../SemanticModel/Tasks/Run';

export const generateCheckoutTask = (task: Checkout) => {
  return {
    uses: 'actions/checkout@v3',
    with: {
      repository: task.getRepositoryURL()
    }
  }
}

export const generateRunTask = (task: Run) => {
  let runCommand = "";

  if (task.getCommands().length == 1) { 
    runCommand = task.getCommands()[0];
  } else if (task.getCommands().length > 1) { 
    for (let i = 0; i < task.getCommands().length; i++) {
      runCommand += `${task.getCommands()[i]}\n`;
    }
  }

  return {
    run: runCommand
  }
}

export const generateBuildDockerImageTask = (task: BuildDockerImage) => {
  return [
    {
      name: "Set up QEMU",
      uses: "docker/setup-qemu-action@v2"
    },
    {
      name: "Set up Docker Buildx",
      uses: "docker/setup-buildx-action@v2"
    },
    {
      name: "Login to DockerHub",
      uses: "docker/login-action@v2",
      with:
      {
        username: task.getUserName(),
        password: task.getPassword()
      }
    },
    {
      name: "Build and push",
      uses: "docker/build-push-action@v3",
      with: {
        push: true,
        tags: `${task.getUserName()}/${task.getImageName()}:latest}`,
      }
    }
  ] 
}

export const generatePullDockerImageTask = (task: PullDockerImage) => { 
  return {
    uses: "djbender/docker-buildx-pull-or-build@v0.5",
    with: {
      docker_username: task.getUserName(),
      docker_password: task.getPassword(),
      // will pull if dockerfile path is left empty
      dockerfile: "",
      image: task.getImageName()
    }
  }
}