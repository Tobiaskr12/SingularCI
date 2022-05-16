import Task from './Task';

export default class Job{
    constructor(private name: string, private tasks: Task[]){}

    getName(): string {
        return this.name;
    }

    getTasks():Task[]{
        return this.tasks;
    }
}
export type dockerBuildSyntax = {
    image_name: string,
    docker_file_path: string,
    user_name: string,
    password: string
}

export type dockerPullSyntax = {
    user_name: string,
    password: string,
    image_name: string
}

export type JobSyntaxType = {
    name: string,
    run?: string[];
    docker_build?: dockerBuildSyntax;
    docker_pull?: dockerPullSyntax;
    checkout?: string
}