import { Service } from "typedi";
import Task from "../SemanticModel/interfaces/Task";

@Service({ id: 'JobBuilder' })
export default class JobBuilder {
    private tasks: Task[] = [];
    private name = "";

    setName(name: string) {
        this.name = name;
    }

    getName(): string {
        return this.name;
    }

    addTask(task: Task) {
        this.tasks.push (task)
    }

    getTasks(): Task[] {
        return this.tasks;
    }
}