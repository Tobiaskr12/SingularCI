import 'reflect-metadata';

import { Container } from "typedi";
import DSLParser from '../../src/Parser/DSLParser';
import IPipeline from '../../src/SemanticModel/interfaces/IPipeline';
import { GitHubConfigGenerator } from '../../src/Targets/GitHubModule';
import { GitLabConfigGenerator } from '../../src/Targets/GitLabModule';
import Pipeline from '../../src/SemanticModel/Pipeline';
import { BuildDockerImageFactory } from '../../src/SemanticModel/Tasks/BuildDockerImage';
import { TriggerFactory } from '../../src/SemanticModel/Trigger';
import VariablesFactory from '../../src/SemanticModel/Variables';
import { TargetsFactory } from '../../src/SemanticModel/Targets';
import StageFactory from '../../src/SemanticModel/Stage';
import RunFactory from '../../src/SemanticModel/Tasks/Run';
import Job from '../../src/SemanticModel/Job';
import fs from 'fs';
import path from 'path';

let parser: DSLParser;
let expectedPipeline: IPipeline;

beforeAll(() => {
  Container.import([
    GitHubConfigGenerator,
    GitLabConfigGenerator,
    Pipeline,
    BuildDockerImageFactory,
    TriggerFactory
  ]);

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

  const environment = "ubuntu-latest";

  const task1_stage1 = runFactory.createRunTask(['apt-get update -y','apt-get install -y nodejs', 'npm install','npm run lint']);
  const job1_stage1 = new Job('Lint', [task1_stage1]);
  const stage1 = stageFactory.createStage("lintstage", [job1_stage1], [], environment);
  
  const task1_stage2 = runFactory.createRunTask(['echo build done'])
  const job1_stage2 = new Job("build",[task1_stage2])
  const needs = "lintstage";
  const stage2 = stageFactory.createStage("buildstage", [job1_stage2], [needs], environment)

  expectedPipeline.addStage(stage1);
  expectedPipeline.addStage(stage2);
}

test('Comparing Pipeline to expected Pipeline', () => {
  Container.set('dslparser.inputFileName', './test/Parser/testfile.yml');
  parser = Container.get<DSLParser>('dslparser');

  const resultPipeline = parser.parse();
  
  expect(resultPipeline).toEqual(expectedPipeline);
});

test('Attempting to parse an input file without the triggers key throws an error', () => {
  Container.set('dslparser.inputFileName', './test/Parser/testfile_missing_triggers.yml');
  parser = Container.get<DSLParser>('dslparser');

  expect(() => {
    parser.parse();
  }).toThrow();
});

test('Attempting to parse an input file without the targets key throws an error', () => {
  Container.set('dslparser.inputFileName', './test/Parser/testfile_missing_targets.yml');
  parser = Container.get<DSLParser>('dslparser');

  expect(() => {
    parser.parse();
  }).toThrow();
});

test('Attempting to parse an input file without the pipeline key throws an error', () => {
  Container.set('dslparser.inputFileName', './test/Parser/testfile_missing_pipeline.yml');
  parser = Container.get<DSLParser>('dslparser');

  expect(() => {
    parser.parse();
  }).toThrow();
});

afterEach(() => {
  Container.reset();
});

afterAll(() => {
  setTimeout(() => {
    if (fs.existsSync(path.join(process.cwd(), ".singularci-copy.yml"))) {
      fs.rmSync(path.join(process.cwd(), ".singularci-copy.yml"));
    }
  }, 100);
})