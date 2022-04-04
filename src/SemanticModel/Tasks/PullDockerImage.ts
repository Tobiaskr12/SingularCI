import Task from '../../Common/Task';

export default class PullDockerImage implements Task {

  constructor(
    private name: string,
    private imageName: string,
    private userName: string
  ) {}

  getName(): string {
    return this.name;
  }

  getImageName(): string {
    return this.imageName;
  }

  getUserName(): string {
    return this.userName;
  }
  
}