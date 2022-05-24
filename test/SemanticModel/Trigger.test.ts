import { TriggerFactory } from "../../src/SemanticModel/Trigger";

const triggerFactory = new TriggerFactory();

test('providing an invalid trigger type should throw an error', () => {
  expect(() => {
    triggerFactory.createTrigger().addType('invalid-trigger');
  }).toThrow();
});

test('providing a valid trigger type should add it to the triggers', () => {
  const trigger = triggerFactory.createTrigger();
  trigger.addType('push');
  expect(trigger.getTypes()).toContain('push');
});

test('providing a valid trigger should not add it to the triggers if it is already there', () => {
  const trigger = triggerFactory.createTrigger();
  trigger.addType('push');
  trigger.addType('push');
  expect(trigger.getTypes()).toHaveLength(1);
});

test('calling reset should remove all triggers', () => {
  const trigger = triggerFactory.createTrigger();

  trigger.addType('push');
  trigger.addType('pull_request');

  expect(trigger.getTypes()).toHaveLength(2);

  trigger.reset();

  expect(trigger.getTypes()).toHaveLength(0);
});

test('calling reset should remove all branches', () => {
  const trigger = triggerFactory.createTrigger();

  trigger.addBranch('master');
  trigger.addBranch('develop');

  expect(trigger.getBranches()).toHaveLength(2);

  trigger.reset();

  expect(trigger.getBranches()).toHaveLength(0);
});
