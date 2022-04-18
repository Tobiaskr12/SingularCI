import Task from '../../Common/Task';

export default class BuildDockerImage implements Task {

  constructor(
    private name: string,
    private imageName: string,
    private buildFilePath: string,
    private userName: string,
    private password: string,
  ) {}

  getName(): string {
    return this.name;
  }

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

}