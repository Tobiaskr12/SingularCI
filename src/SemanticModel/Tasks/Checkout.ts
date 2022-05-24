import { Service } from 'typedi';
import Task from '../interfaces/Task';
import ICheckout from './../interfaces/ICheckout';
import { TaskType } from './TaskEnum';

@Service({ id: 'CheckoutFactory' })
export default class CheckoutFactory {
  createCheckoutTask(repositoryURL: string) {
    return new Checkout(repositoryURL);
  }
}

class Checkout implements Task, ICheckout {

  type = TaskType.Checkout;

  constructor(
    private repositoryURL: string,
  ){}

  getRepositoryURL(): string {
    return this.repositoryURL;
  }

  getType(): TaskType {
    return this.type;
  }
}