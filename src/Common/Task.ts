/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable semi */

/**
 * @typedef {Object} Task
 * This interface is used to identify a task.
 */
export default interface Task {

} 

export type TaskSyntaxType = {
    name: string;
    run?: string;
    docker_build?: {
        image_name: string,
        docker_file_path: string
    };
}