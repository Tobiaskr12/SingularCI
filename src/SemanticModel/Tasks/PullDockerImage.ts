import Task from '../../Common/Task';

export default class PullDockerImage implements Task {

  constructor(
    private imageName: string,
    private userName: string,
    private password: string,
  ) {}

  getImageName(): string {
    return this.imageName;
  }

  getUserName(): string {
    return this.userName;
  }

  getPassword(): string {
    return this.password;
  }
  
}