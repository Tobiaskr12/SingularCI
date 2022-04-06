import { Logger } from 'tslog';
import { TargetPlatformGenerator } from '../Common/TargetPlatformGenerator';
import DSLParser from '../Parser/DSLParser';
import { GitHubConfigGenerator } from './../Targets/GitHubModule/index';

const log: Logger = new Logger();

const parser = new DSLParser('.singularci.yml');

const main = () => {
  const semanticModel = parser.parse();

  const gitHubConfigGenerator: TargetPlatformGenerator = new GitHubConfigGenerator(semanticModel);
  gitHubConfigGenerator.generateConfig();
  
}

main();
