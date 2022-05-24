import IPipeline from "../../src/SemanticModel/interfaces/IPipeline";
import ITargets from "../../src/SemanticModel/interfaces/ITargets";
import ITrigger from "../../src/SemanticModel/interfaces/ITrigger";
import IVariables from "../../src/SemanticModel/interfaces/IVariables";
import Pipeline from "../../src/SemanticModel/Pipeline";
import StageFactory from "../../src/SemanticModel/Stage";
import { TargetsFactory } from "../../src/SemanticModel/Targets";
import { TriggerFactory } from "../../src/SemanticModel/Trigger";
import VariablesFactory from "../../src/SemanticModel/Variables";

let pipeline: IPipeline;
let trigger: ITrigger;
let variables: IVariables;
let platformTargets: ITargets;

const triggerFactory = new TriggerFactory();
const variablesFactory = new VariablesFactory();
const targetsFactory = new TargetsFactory();
const stageFactory = new StageFactory();

beforeEach(() => {
  trigger = triggerFactory.createTrigger();
  variables = variablesFactory.createVariables();
  platformTargets = targetsFactory.createTargets();

  pipeline = new Pipeline(trigger, platformTargets, variables);
});

it('should be possible to change the trigger object on a pipeline', () => {
  const oldTrigger = trigger;
  const newTrigger = triggerFactory.createTrigger();

  oldTrigger.addBranch('old-trigger-branch');
  oldTrigger.addType('push');

  newTrigger.addBranch('new-trigger-branch');
  newTrigger.addType('push');

  pipeline.setTrigger(newTrigger);

  expect(pipeline.getTrigger()).not.toBe(oldTrigger);
});

it('should be possible to change the variables object on a pipeline', () => {
  const oldVariables = variables;
  const newVariables = variablesFactory.createVariables();

  oldVariables.addVariable('old-variable-key', 'old-variable-value');
  newVariables.addVariable('new-variable-key', 'new-variable-value');

  pipeline.setVariables(newVariables);

  expect(pipeline.getVariables()).not.toBe(oldVariables);
});

it('should be possible to change the targets object on a pipeline', () => { 
  const oldTargets = platformTargets;
  const newTargets = targetsFactory.createTargets();

  oldTargets.addTarget('GitHub');
  newTargets.addTarget('GitLab');

  pipeline.setPlatformTargets(newTargets);

  expect(pipeline.getPlatformTargets()).not.toBe(oldTargets);
});

it('should be possible to add stages to a pipeline', () => {
  const stage1 = stageFactory.createStage("stage1", [], [], "ubuntu-latest");
  const stage2 = stageFactory.createStage("stage2", [], [], "ubuntu-latest");

  
  pipeline.addStage(stage1);
  pipeline.addStage(stage2);

  expect(pipeline.getStages().length).toBe(2);
});

test('when the reset method is called, all fields should be reset', () => {
  const stage = stageFactory.createStage("stage1", [], [], "ubuntu-latest");

  pipeline.addStage(stage);

  trigger.addBranch('master');
  trigger.addType('push');

  variables.addVariable('key', 'value');

  platformTargets.addTarget('GitHub');

  expect(pipeline.getTrigger().getBranches()).toHaveLength(1);
  expect(pipeline.getTrigger().getTypes()).toHaveLength(1);
  expect(pipeline.getVariables().getVariables()).toEqual({ key: 'value' });
  expect(pipeline.getPlatformTargets().getTargets()).toHaveLength(1);
  expect(pipeline.getStages().length).toBe(1);

  pipeline.reset();

  expect(pipeline.getTrigger().getBranches()).toHaveLength(0);
  expect(pipeline.getTrigger().getTypes()).toHaveLength(0);
  expect(pipeline.getVariables().getVariables()).toEqual({});
  expect(pipeline.getPlatformTargets().getTargets()).toHaveLength(0);
  expect(pipeline.getStages().length).toBe(0);
});
