import { Service } from 'typedi';
import IBuildDockerImage from '../interfaces/IBuildDockerImage';
import Task from '../interfaces/Task';
import { TaskType } from './TaskEnum';

@Service({ id: 'BuildDockerImageFactory' })
export class BuildDockerImageFactory {
  createBuildDockerImageTask(
    imageName: string,
    dockerFilePath: string,
    userName: string,
    password: string,
  ) {
    return new BuildDockerImage(
      imageName,
      dockerFilePath,
      userName,
      password,
    );
  }
}

class BuildDockerImage implements Task, IBuildDockerImage {

  type = TaskType.BuildDockerImage;

  constructor(
    private imageName: string,
    private buildFilePath: string,
    private userName: string,
    private password: string,
  ) {}

  getImageName(): string {
    return this.imageName;
  }

  getBuildFilePath(): string {
    return this.buildFilePath;
  }
  
  getUserName(): string {
    return this.userName;
  }

  getPassword(): string {
    return this.password;
  }

  getType(): TaskType {
    return this.type;
  }

}