import Task from '../../Common/Task';

export default class Run implements Task {
    constructor(
        private commands: string[],
    ){}
    
    getCommands(): string[] {
        return this.commands;
    }
}

