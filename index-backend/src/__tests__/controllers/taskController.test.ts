import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../middlewares/errorHandler";
import {
  getProjectTasks,
  patchTaskStatus,
  postProjectTask,
} from "../../controllers/taskController";
import * as projectModel from "../../models/projectModel";
import * as taskModel from "../../models/taskModel";

jest.mock("../../models/projectModel");
jest.mock("../../models/taskModel");

const mockedProjectModel = jest.mocked(projectModel);
const mockedTaskModel = jest.mocked(taskModel);

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;
}

const project = {
  id: "project-1",
  name: "Client onboarding",
  createdAt: "2026-06-25T10:00:00.000Z",
};

const task = {
  id: "task-1",
  projectId: "project-1",
  title: "Prepare kickoff notes",
  status: "todo" as const,
  createdAt: "2026-06-25T10:05:00.000Z",
};

describe("taskController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProjectTasks", () => {
    it("returns project tasks with status 200", async () => {
      const req = {
        params: { projectId: "project-1" },
        query: { status: "todo" },
      } as unknown as Request;
      const res = createResponse();
      const next = jest.fn() as NextFunction;

      mockedProjectModel.findProjectById.mockResolvedValue(project);
      mockedTaskModel.listTasksByProject.mockResolvedValue([task]);

      await getProjectTasks(req, res, next);

      expect(mockedProjectModel.findProjectById).toHaveBeenCalledWith(
        "project-1",
      );
      expect(mockedTaskModel.listTasksByProject).toHaveBeenCalledWith(
        "project-1",
        "todo",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: [task] });
      expect(next).not.toHaveBeenCalled();
    });

    it("returns a 404 AppError when the project does not exist", async () => {
      const req = {
        params: { projectId: "project-1" },
        query: {},
      } as unknown as Request;
      const res = createResponse();
      const next = jest.fn() as jest.Mock;;

      mockedProjectModel.findProjectById.mockResolvedValue(null);

      await getProjectTasks(req, res, next);

      const forwardedError = next.mock.calls[0][0] as AppError;

      expect(forwardedError).toBeInstanceOf(AppError);
      expect(forwardedError.statusCode).toBe(404);
      expect(forwardedError.code).toBe("PROJECT_NOT_FOUND");
      expect(forwardedError.message).toBe("Project was not found.");
    });
  });

  describe("postProjectTask", () => {
    it("creates a task with status 201", async () => {
      const req = {
        params: { projectId: "project-1" },
        body: { title: "Prepare kickoff notes" },
      } as unknown as Request;
      const res = createResponse();
      const next = jest.fn() as NextFunction;

      mockedProjectModel.findProjectById.mockResolvedValue(project);
      mockedTaskModel.createTask.mockResolvedValue(task);

      await postProjectTask(req, res, next);

      expect(mockedTaskModel.createTask).toHaveBeenCalledWith(
        "project-1",
        "Prepare kickoff notes",
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: task });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("patchTaskStatus", () => {
    it("updates a task status with status 200", async () => {
      const req = {
        params: { projectId: "project-1", taskId: "task-1" },
        body: { status: "done" },
      } as unknown as Request;
      const res = createResponse();
      const next = jest.fn() as NextFunction;
      const updatedTask = { ...task, status: "done" as const };

      mockedProjectModel.findProjectById.mockResolvedValue(project);
      mockedTaskModel.updateTaskStatus.mockResolvedValue(updatedTask);

      await patchTaskStatus(req, res, next);

      expect(mockedTaskModel.updateTaskStatus).toHaveBeenCalledWith(
        "project-1",
        "task-1",
        "done",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: updatedTask });
      expect(next).not.toHaveBeenCalled();
    });

    it("returns a 404 AppError when the task does not exist", async () => {
      const req = {
        params: { projectId: "project-1", taskId: "task-1" },
        body: { status: "done" },
      } as unknown as Request;
      const res = createResponse();
      const next = jest.fn() as jest.Mock;;

      mockedProjectModel.findProjectById.mockResolvedValue(project);
      mockedTaskModel.updateTaskStatus.mockResolvedValue(null);

      await patchTaskStatus(req, res, next);

      const forwardedError = next.mock.calls[0][0] as AppError;

      expect(forwardedError).toBeInstanceOf(AppError);
      expect(forwardedError.statusCode).toBe(404);
      expect(forwardedError.code).toBe("TASK_NOT_FOUND");
      expect(forwardedError.message).toBe(
        "Task was not found for this project.",
      );
    });
  });
});
