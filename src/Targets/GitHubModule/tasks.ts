import ICheckout from "../../SemanticModel/interfaces/ICheckout";
import IRun from "../../SemanticModel/interfaces/IRun";
import IBuildDockerImage from './../../SemanticModel/interfaces/IBuildDockerImage';

export const generateCheckoutTask = (task: ICheckout) => {
  let runCommand = "";

  runCommand += `git clone ${task.getRepositoryURL()}`;

  return {
    run: runCommand
  }
}

export const generateRunTask = (task: IRun) => {
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

export const generateBuildDockerImageTask = (task: IBuildDockerImage) => {
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
        tags: `${task.getUserName()}/${task.getImageName()}:latest`,
        file: `${task.getBuildFilePath()}Dockerfile`
      }
    }
  ] 
}