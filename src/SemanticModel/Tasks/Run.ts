import Task from '../interfaces/Task';
import IRun from '../interfaces/IRun';
import { Service } from 'typedi';
import {TaskType} from './TaskEnum'

@Service({ id: "RunFactory" })
export default class RunFactory {
    createRunTask(commands: string[]) {
        return new Run(commands);
    }
}

class Run implements Task, IRun {
    type = TaskType.Run;
    
    constructor(
        private commands: string[],
    ){}
    
    getCommands(): string[] {
        return this.commands;
    }

    getType(): TaskType {
        return this.type;
      }
}

