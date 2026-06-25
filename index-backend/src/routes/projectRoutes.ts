import { Router } from "express";
import {
  deleteProject,
  getProjects,
  postProject,
} from "../controllers/projectController";
import {
  getProjectTasks,
  patchTaskStatus,
  postProjectTask,
} from "../controllers/taskController";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createProjectSchema,
  createTaskSchema,
  deleteProjectSchema,
  listTasksSchema,
  updateTaskStatusSchema,
} from "../schemas/schemas";

export const projectRoutes = Router();

projectRoutes.get("/", getProjects);

projectRoutes.post("/", validateRequest(createProjectSchema), postProject);

projectRoutes.delete(
  "/:projectId",
  validateRequest(deleteProjectSchema),
  deleteProject,
);

projectRoutes.get(
  "/:projectId/tasks",
  validateRequest(listTasksSchema),
  getProjectTasks,
);

projectRoutes.post(
  "/:projectId/tasks",
  validateRequest(createTaskSchema),
  postProjectTask,
);

projectRoutes.patch(
  "/:projectId/tasks/:taskId/status",
  validateRequest(updateTaskStatusSchema),
  patchTaskStatus,
);
