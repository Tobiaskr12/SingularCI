#!/usr/bin/env node

import 'reflect-metadata';
import Container, { Inject, Service } from 'typedi';

import { TargetPlatformGenerator } from '../Targets/interfaces/TargetPlatformGenerator';
import { GitLabConfigGenerator } from '../Targets/GitLabModule';
import { GitHubConfigGenerator } from './../Targets/GitHubModule/index';
import fs from 'fs';
import Pipeline from '../SemanticModel/Pipeline';

Container.import([
  GitHubConfigGenerator,
  GitLabConfigGenerator,
  Pipeline
]);

@Service({ id: 'program' })
class Program {
  private configGenerators: TargetPlatformGenerator[] = [];

  constructor(
    @Inject('GitHubConfigGenerator') githubConfigGenerator: TargetPlatformGenerator,
    @Inject('GitLabConfigGenerator') gitlabConfigGenerator: TargetPlatformGenerator,
  ) {
    this.configGenerators.push(githubConfigGenerator);
    this.configGenerators.push(gitlabConfigGenerator);
  }

  public main = () => {
    for (const configGenerator of this.configGenerators) {
        configGenerator.generateConfig()
    }
  }
}

Container.set('dslparser.inputFileName', '.singularci.yml');
const program = Container.get<Program>('program');

program.main();

fs.rmSync('.singularci-copy.yml');