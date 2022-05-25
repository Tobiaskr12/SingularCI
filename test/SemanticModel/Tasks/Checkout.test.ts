import ICheckout from "../../../src/SemanticModel/interfaces/ICheckout";
import CheckoutFactory from "../../../src/SemanticModel/Tasks/Checkout";
import { TaskType } from "../../../src/SemanticModel/Tasks/TaskEnum";

let checkout: ICheckout;
const repoUrl = "fake-repo.remote.git";
const repoName = "FakeRepo";

beforeEach(() => {
  const checkoutFactory = new CheckoutFactory();
  checkout = checkoutFactory.createCheckoutTask(repoUrl, repoName);
});

test("getRepositoryURL should be able to get the repository URL", () => {
  expect(checkout.getRepositoryURL()).toBe("fake-repo.remote.git");
});

test("getRepositoryName should be able to get the repository name", () => {
  expect(checkout.getRepositoryName()).toBe("FakeRepo");
});

test('getType should be able to get the correct task type', () => {
  const localCheckout = new CheckoutFactory().createCheckoutTask("", "");
  expect(localCheckout.getType()).toBe(TaskType.Checkout);
});