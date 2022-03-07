import Task from '../../Common/Task';

export default class Run implements Task{
    constructor(private command:string){}

    getCommand():string{
        return this.command;
    }
}