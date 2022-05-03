import 'reflect-metadata';
import Container, { Inject, Service } from 'typedi';

import { TargetPlatformGenerator } from '../Common/TargetPlatformGenerator';
import DSLParser from '../Parser/DSLParser';
import { GitLabConfigGenerator } from '../Targets/GitLabModule';
import { GitHubConfigGenerator } from './../Targets/GitHubModule/index';

@Service({ id: 'program' })
class Program {
  private parser: DSLParser;
  
  constructor(@Inject('dslparser') parser: DSLParser) {
    this.parser = parser
  }
  
  public main = () => {
    const gitHubConfigGenerator: TargetPlatformGenerator = new GitHubConfigGenerator(this.parser.parse());
    gitHubConfigGenerator.generateConfig();
    
    const gitLabConfigGenerator: TargetPlatformGenerator = new GitLabConfigGenerator(this.parser.parse());
    gitLabConfigGenerator.generateConfig();
    
  }
}

Container.set('dslparser.inputFileName', '.singularci.yml');
const program = Container.get<Program>('program');
program.main();
