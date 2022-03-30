import Task from "../Common/Task";

export default class JobBuilder{
    private tasks: Task[] = [];

    addTask(task:Task) {
        this.tasks.push (task)
    }

    getTasks(): Task[] {
        return this.tasks;
    }
}