import { TaskType } from "../Tasks/TaskEnum";

export default interface Task {
  type: TaskType
  getType(): TaskType;
} 