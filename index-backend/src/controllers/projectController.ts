import type { RequestHandler } from "express";
import {
  createProject,
  deleteProjectById,
  listProjects,
} from "../models/projectModel";
import { AppError } from "../middlewares/errorHandler";

type PostgresError = Error & { code?: string };

/**
 * Get all projects.
 */
export const getProjects: RequestHandler = async (_req, res, next) => {
  try {
    const projects = await listProjects();
    res.status(200).json({ data: projects });
  } catch (error) {
    next(error);
  }
};

// Create a new project
export const postProject: RequestHandler = async (req, res, next) => {
  try {
    const project = await createProject(req.body.name);
    res.status(201).json({ data: project });
  } catch (error) {
    if ((error as PostgresError).code === "23505") {
      next(
        new AppError(
          409,
          "PROJECT_NAME_ALREADY_EXISTS",
          "A project with this name already exists.",
        ),
      );
      return;
    }

    next(error);
  }
};

export const deleteProject: RequestHandler = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    if (!projectId || typeof projectId !== "string") {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        "Invalid projectId parameter",
      );
    }

    await deleteProjectById(projectId);

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === "PROJECT_NOT_FOUND") {
      next(new AppError(404, "PROJECT_NOT_FOUND", "Project was not found."));
      return;
    }

    // if ((error as PostgresError).code === "23503") {
    //   next(
    //     new AppError(
    //       409,
    //       "PROJECT_HAS_TASKS",
    //       "Project cannot be deleted while it still has tasks.",
    //     ),
    //   );
    //   return;
    // }

    next(error);
  }
};
