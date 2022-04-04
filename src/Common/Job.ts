import Task from './Task';

export default class Job{
    constructor(private tasks: Task[]){}

    getTasks():Task[]{
        return this.tasks;
    }
}