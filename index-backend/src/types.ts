export const taskStatuses = ["todo", "in_progress", "done"] as const;

export type TaskStatus = (typeof taskStatuses)[number];

export type Project = {
  id: string;
  name: string;
  createdAt: string;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
};

export type ProjectRow = {
  id: string;
  name: string;
  created_at: Date;
};

export type TaskRow = {
  id: string;
  project_id: string;
  title: string;
  status: TaskStatus;
  created_at: Date;
};

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "PROJECT_NOT_FOUND"
  | "PROJECT_HAS_TASKS"
  | "TASK_NOT_FOUND"
  | "PROJECT_NAME_ALREADY_EXISTS"
  | "INTERNAL_SERVER_ERROR"
  | "NOT_FOUND";
