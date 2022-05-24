import 'reflect-metadata';

import util from 'util'
import { Container } from "typedi";
import Pipeline from "../src/SemanticModel/Pipeline";
import { BuildDockerImageFactory } from "../src/SemanticModel/Tasks/BuildDockerImage";
import { GitHubConfigGenerator } from "../src/Targets/GitHubModule";
import { GitLabConfigGenerator } from "../src/Targets/GitLabModule";
import DSLParser from './../src/Parser/DSLParser';
import IPipeline from '../src/SemanticModel/interfaces/IPipeline';
import { TargetsFactory } from '../src/SemanticModel/Targets';
import { TriggerFactory } from '../src/SemanticModel/Trigger';
import VariablesFactory from '../src/SemanticModel/Variables';
import StageFactory from '../src/SemanticModel/Stage';
import Job from '../src/SemanticModel/Job';
import RunFactory from './../src/SemanticModel/Tasks/Run';

let parser: DSLParser;
let expectedPipeline: IPipeline;

beforeAll(() => {
  Container.import([
    GitHubConfigGenerator,
    GitLabConfigGenerator,
    Pipeline,
    BuildDockerImageFactory
  ]);

  Container.set('dslparser.inputFileName', './test/testfile.yml');
  parser = Container.get<DSLParser>('dslparser');

  setupExpectedPipeline();
})

const setupExpectedPipeline = () => {
  const triggerFactory = new TriggerFactory();
  const variablesFactory = new VariablesFactory();
  const platformTargets = new TargetsFactory();
  const stageFactory = new StageFactory();
  const runFactory = new RunFactory();

  const trigger = triggerFactory.createTrigger();
  const variables = variablesFactory.createVariables();
  const targets = platformTargets.createTargets();
  
  targets.addTarget('GitHub')
  targets.addTarget('GitLab')
  
  trigger.addBranch('master');
  trigger.addBranch('main');
  trigger.addType('push');

  variables.addVariable('testKey', 'testValue');
  
  expectedPipeline = new Pipeline(trigger, targets, variables);

  const task1 = runFactory.createRunTask(['apt-get update -y','apt-get install -y nodejs', 'npm install','npm run lint']);

  const job1 = new Job('Lint', [task1]);
  const stage = stageFactory.createStage("lintstage", [job1], [], "ubuntu-latest");
  
  expectedPipeline.addStage(stage);
  console.log(util.inspect(expectedPipeline, false, null, true));
}

test('Comparing Pipeline to expected Pipeline', () => {
  const resultPipeline = parser.parse();
  
  expect(resultPipeline).toEqual(expectedPipeline);
});
