import Job from "../../src/SemanticModel/Job";
import RunFactory from './../../src/SemanticModel/Tasks/Run';
import CheckoutFactory from './../../src/SemanticModel/Tasks/Checkout';

it('should be possible to get the name of a job', () => {
  const jobName = 'jobName';  
  const job = new Job(jobName, []);
    expect(job.getName()).toBe(jobName);
});

it('should be possible to get the tasks of a job', () => {
  const jobName = 'jobName';
  const runFactory = new RunFactory();
  const checkoutFactory = new CheckoutFactory();

  const task1 = runFactory.createRunTask(['echo "This is a test task"']);
  const task2 = checkoutFactory.createCheckoutTask('fake-repo.remote.git', 'repoName');

  const job = new Job(jobName, [task1, task2]);

  expect(job.getTasks()).toContain(task1);
  expect(job.getTasks()).toContain(task2);
});
