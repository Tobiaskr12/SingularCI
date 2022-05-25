import ICheckout from "../../../src/SemanticModel/interfaces/ICheckout";
import CheckoutFactory from "../../../src/SemanticModel/Tasks/Checkout";
import { TaskType } from "../../../src/SemanticModel/Tasks/TaskEnum";

let checkout: ICheckout;

beforeEach(() => {
  const checkoutFactory = new CheckoutFactory();
  checkout = checkoutFactory.createCheckoutTask("fake-repo.remote.git");
});

test("getRepositoryURL should be able to get the repository URL", () => {
  expect(checkout.getRepositoryURL()).toBe("fake-repo.remote.git");
});

test('getType should be able to get the correct task type', () => {
  const localCheckout = new CheckoutFactory().createCheckoutTask("");
  expect(localCheckout.getType()).toBe(TaskType.Checkout);
});