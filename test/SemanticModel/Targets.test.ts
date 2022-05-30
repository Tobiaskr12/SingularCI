import { TargetsFactory } from "../../src/SemanticModel/Targets";

const targetsFactory = new TargetsFactory();

test('providing an invalid target should throw an error', () => {
  expect(() => {
    targetsFactory.createTargets().addTarget('invalid-target');
  }).toThrow();
});

test('providing a valid target should add it to the targets', () => {
  const targets = targetsFactory.createTargets();

  targets.addTarget('GitHub');

  expect(targets.getTargets()).toContain('GitHub');
});

test('providing a valid target should not add it to the targets if it is already there', () => {
  const targets = targetsFactory.createTargets();

  targets.addTarget('GitHub');

  expect(() => {
    targets.addTarget('GitHub');
  }).toThrow();
});

test('calling reset should remove all targets', () => {
  const targets = targetsFactory.createTargets();

  targets.addTarget('GitHub');
  targets.addTarget('GitLab');

  expect(targets.getTargets()).toHaveLength(2);

  targets.reset();

  expect(targets.getTargets()).toHaveLength(0);
});