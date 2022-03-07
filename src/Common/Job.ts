import Task from './Task';

export default class Job{
    constructor(private name: string, private tasks: Task[]){}
    
    getName():string{
        return this.name;
    }
    
    getTasks():Task[]{
        return this.tasks;
    }
}