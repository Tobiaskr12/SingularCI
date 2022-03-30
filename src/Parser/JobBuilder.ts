import Task from "../Common/Task";

export type JobType = {
    run?: string;
    docker_build?: {
        image_name: string,
        docker_file_path: string
    };
}

export default class JobBuilder{
    private tasks: Task[] = [];

    addTask(task:Task) {
        this.tasks.push (task)
    }

    getTasks(): Task[] {
        return this.tasks;
    }
}