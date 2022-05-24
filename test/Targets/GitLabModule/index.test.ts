import 'reflect-metadata';

import fs from 'fs';
import path from 'path';
import Container from 'typedi';
import DSLParser from '../../../src/Parser/DSLParser';
import Pipeline from '../../../src/SemanticModel/Pipeline';
import { BuildDockerImageFactory } from '../../../src/SemanticModel/Tasks/BuildDockerImage';
import { TriggerFactory } from '../../../src/SemanticModel/Trigger';
import { GitHubConfigGenerator } from '../../../src/Targets/GitHubModule';
import { GitLabConfigGenerator } from '../../../src/Targets/GitLabModule';

let parser: DSLParser;

beforeAll(() => {
  Container.import([
    GitHubConfigGenerator,
    GitLabConfigGenerator,
    Pipeline,
    BuildDockerImageFactory,
    TriggerFactory
  ]);

  Container.set('dslparser.inputFileName', './test/Parser/testfile.yml');
  parser = Container.get<DSLParser>('dslparser');
})

test('When the generateConfig method has been run, a CI/CD config file should be generated', () => {

  if (fs.existsSync(path.join(process.cwd(), ".gitlab-ci.yml"))) {
    fs.rmSync(path.join(process.cwd(), ".gitlab-ci.yml"));
  }

  expect(fs.existsSync(path.join(process.cwd(), ".gitlab-ci.yml"))).toBe(false);

  const gitlabModule = new GitLabConfigGenerator(parser);
  gitlabModule.generateConfig();

  expect(fs.existsSync(path.join(process.cwd(), ".gitlab-ci.yml"))).toBe(true);
  expect(fs.readFileSync(path.join(process.cwd(), ".gitlab-ci.yml"), 'utf8').length).toBeGreaterThan(50);

  if (fs.existsSync(path.join(process.cwd(), ".singularci-copy.yml"))) {
    fs.rmSync(path.join(process.cwd(), ".singularci-copy.yml"));
  }
});