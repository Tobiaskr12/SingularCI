import { Logger } from 'tslog';
import DSLParser from '../Parser/DSLParser';

const log: Logger = new Logger();

const parser = new DSLParser('.singularci.yml');

log.info(parser.parse());

