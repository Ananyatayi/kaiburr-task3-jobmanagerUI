export type TaskExecution = {
  startTime: string;
  endTime: string;
  output: string;
};

export type Task = {
  id?: string;
  name: string;
  owner: string;
  command: string;
  taskExecutions: TaskExecution[];
};
