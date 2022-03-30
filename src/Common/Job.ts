import Task from './Task';

export type JobSyntaxType = {
    run?: string;
    docker_build?: {
        image_name: string,
        docker_file_path: string
    };
}

export default class Job{
    constructor(private tasks: Task[]){}

    getTasks():Task[]{
        return this.tasks;
    }
}