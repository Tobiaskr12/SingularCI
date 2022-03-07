import Task from '../../Common/Task';

export default class BuildDockerImage implements Task {

  constructor(
    private imageName: string,
    private buildFilePath: string
  ) {}

  getImageName(): string {
    return this.imageName;
  }

  getBuildFilePath(): string {
    return this.buildFilePath;
  }

}