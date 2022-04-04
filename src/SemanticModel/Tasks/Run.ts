import Task from '../../Common/Task';

export default class Run implements Task{
    constructor(
			private name:string,
			private command:string,
    ){}
    
    getName():string{
        return this.name;
    }

    getCommand():string{
        return this.command;
    }
}