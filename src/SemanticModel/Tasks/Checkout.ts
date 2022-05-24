import Task from '../Task';

export default class Checkout implements Task {

  constructor(

    private repositoryURL: string
  ){}

  getRepositoryURL(): string {
    return this.repositoryURL;
  }

}