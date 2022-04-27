import { Logger } from 'tslog';
import SemanticModel from '../Common/SemanticModel';
import { TargetPlatformGenerator } from '../Common/TargetPlatformGenerator';
import DSLParser from '../Parser/DSLParser';
import { GitLabConfigGenerator } from '../Targets/GitLabModule';
import { GitHubConfigGenerator } from './../Targets/GitHubModule/index';

const parser = new DSLParser('.singularci.yml');

const main = () => {
  const gitHubConfigGenerator: TargetPlatformGenerator = new GitHubConfigGenerator(parser.parse());
  gitHubConfigGenerator.generateConfig();

  const gitLabConfigGenerator: TargetPlatformGenerator = new GitLabConfigGenerator(parser.parse());
  gitLabConfigGenerator.generateConfig();
  
}

main();
