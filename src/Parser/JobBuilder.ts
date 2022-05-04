import { Service } from "typedi";
import Task from "../Common/Task";

@Service({ id: 'JobBuilder' })
export default class JobBuilder{
    private tasks: Task[] = [];
    private name: string = "";

    setName(name: string) {
        this.name = name;
    }

    getName(): string {
        return this.name;
    }

    addTask(task:Task) {
        this.tasks.push (task)
    }

    getTasks(): Task[] {
        return this.tasks;
    }
}