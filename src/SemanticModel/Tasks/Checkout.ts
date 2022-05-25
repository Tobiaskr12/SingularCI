import { Service } from 'typedi';
import Task from '../interfaces/Task';
import ICheckout from './../interfaces/ICheckout';
import { TaskType } from './TaskEnum';

@Service({ id: 'CheckoutFactory' })
export default class CheckoutFactory {
  createCheckoutTask(repositoryURL: string, repositoryName: string) {
    return new Checkout(repositoryURL, repositoryName);
  }
}

class Checkout implements Task, ICheckout {

  type = TaskType.Checkout;

  constructor(
    private repositoryURL: string,
    private repositoryName: string
  ){}

  getRepositoryURL(): string {
    return this.repositoryURL;
  }

  getRepositoryName(): string { 
    return this.repositoryName;
  }

  getType(): TaskType {
    return this.type;
  }
}