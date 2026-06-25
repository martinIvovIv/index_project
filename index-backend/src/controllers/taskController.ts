import type { RequestHandler } from "express";
import { AppError } from "../middlewares/errorHandler";
import { findProjectById } from "../models/projectModel";
import {
  createTask,
  listTasksByProject,
  updateTaskStatus,
} from "../models/taskModel";
import type { TaskStatus } from "../types";

async function ensureProjectExists(projectId: string) {
  const project = await findProjectById(projectId);

  if (!project) {
    throw new AppError(404, "PROJECT_NOT_FOUND", "Project was not found.");
  }
}

export const getProjectTasks: RequestHandler = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    if (!projectId || typeof projectId !== "string") {
      throw new AppError(400, "VALIDATION_ERROR", "Invalid projectId parameter");
    }

    await ensureProjectExists(projectId);

    const tasks = await listTasksByProject(
      projectId,
      req.query.status as TaskStatus | undefined,
    );

    res.status(200).json({ data: tasks });
  } catch (error) {
    next(error);
  }
};

export const postProjectTask: RequestHandler = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    if (!projectId || typeof projectId !== "string") {
      throw new AppError(400, "VALIDATION_ERROR", "Invalid projectId parameter");
    }

    await ensureProjectExists(projectId);

    const task = await createTask(projectId, req.body.title);
    res.status(201).json({ data: task });
  } catch (error) {
    next(error);
  }
};

export const patchTaskStatus: RequestHandler = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    if (!projectId || !taskId || typeof projectId !== "string" || typeof taskId !== "string") {
      throw new AppError(400, "VALIDATION_ERROR", "Invalid projectId or taskId parameter");
    }

    await ensureProjectExists(projectId);

    const task = await updateTaskStatus(projectId, taskId, req.body.status);

    if (!task) {
      throw new AppError(
        404,
        "TASK_NOT_FOUND",
        "Task was not found for this project.",
      );
    }

    res.status(200).json({ data: task });
  } catch (error) {
    next(error);
  }
};