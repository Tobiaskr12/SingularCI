import Task from '../../Common/Task';

export default class Checkout implements Task {

  constructor(
    private name: string,
    private repositoryURL: string
  ){}

  getName(): string { return this.name; }

  getRepositoryURL(): string {
    return this.repositoryURL;
  }

}