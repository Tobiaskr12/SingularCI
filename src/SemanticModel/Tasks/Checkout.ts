import Task from '../../Common/Task';

export default class Checkout implements Task {

  constructor(

    private repositoryURL: string
  ){}

  getRepositoryURL(): string {
    return this.repositoryURL;
  }

}