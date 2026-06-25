import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../middlewares/errorHandler";
import {
  deleteProject,
  getProjects,
  postProject,
} from "../../controllers/projectController";
import * as projectModel from "../../models/projectModel";

jest.mock("../../models/projectModel");

const mockedProjectModel = jest.mocked(projectModel);

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  } as unknown as Response;
}

describe("projectController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProjects", () => {
    it("returns projects with status 200", async () => {
      const req = {} as Request;
      const res = createResponse();
      const next = jest.fn() as NextFunction;
      const projects = [
        {
          id: "project-1",
          name: "Client onboarding",
          createdAt: "2026-06-25T10:00:00.000Z",
        },
      ];

      mockedProjectModel.listProjects.mockResolvedValue(projects);

      await getProjects(req, res, next);

      expect(mockedProjectModel.listProjects).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: projects });
      expect(next).not.toHaveBeenCalled();
    });

    it("passes model errors to next", async () => {
      const req = {} as Request;
      const res = createResponse();
      const next = jest.fn() as NextFunction;
      const error = new Error("database offline");

      mockedProjectModel.listProjects.mockRejectedValue(error);

      await getProjects(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("postProject", () => {
    it("creates a project with status 201", async () => {
      const req = { body: { name: "Client onboarding" } } as Request;
      const res = createResponse();
      const next = jest.fn() as NextFunction;
      const project = {
        id: "project-1",
        name: "Client onboarding",
        createdAt: "2026-06-25T10:00:00.000Z",
      };

      mockedProjectModel.createProject.mockResolvedValue(project);

      await postProject(req, res, next);

      expect(mockedProjectModel.createProject).toHaveBeenCalledWith(
        "Client onboarding",
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: project });
      expect(next).not.toHaveBeenCalled();
    });

    it("maps unique constraint errors to AppError", async () => {
      const req = { body: { name: "Client onboarding" } } as Request;
      const res = createResponse();
      const next = jest.fn() as jest.Mock;;
      const error = Object.assign(new Error("duplicate key"), { code: "23505" });

      mockedProjectModel.createProject.mockRejectedValue(error);

      await postProject(req, res, next);

      const forwardedError = next.mock.calls[0][0] as AppError;

      expect(forwardedError).toBeInstanceOf(AppError);
      expect(forwardedError.statusCode).toBe(409);
      expect(forwardedError.code).toBe("PROJECT_NAME_ALREADY_EXISTS");
      expect(forwardedError.message).toBe(
        "A project with this name already exists.",
      );
    });
  });

  describe("deleteProject", () => {
    it("deletes a project with status 204", async () => {
      const req = { params: { projectId: "project-1" } } as unknown as Request;
      const res = createResponse();
      const next = jest.fn() as NextFunction;

      mockedProjectModel.deleteProjectById.mockResolvedValue(undefined);

      await deleteProject(req, res, next);

      expect(mockedProjectModel.deleteProjectById).toHaveBeenCalledWith(
        "project-1",
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 404 AppError when the project does not exist", async () => {
      const req = { params: { projectId: "project-1" } } as unknown as Request;
      const res = createResponse();
      const next = jest.fn() as jest.Mock;;

      mockedProjectModel.deleteProjectById.mockRejectedValue(
        new Error("PROJECT_NOT_FOUND"),
      );

      await deleteProject(req, res, next);

      const forwardedError = next.mock.calls[0][0] as AppError;

      expect(forwardedError).toBeInstanceOf(AppError);
      expect(forwardedError.statusCode).toBe(404);
      expect(forwardedError.code).toBe("PROJECT_NOT_FOUND");
      expect(forwardedError.message).toBe("Project was not found.");
    });

    it.skip("returns 409 AppError when the project still has tasks", async () => {
      const req = { params: { projectId: "project-1" } } as unknown as Request;
      const res = createResponse();
      const next = jest.fn() as jest.Mock;;
      const error = Object.assign(new Error("fk violation"), { code: "23503" });

      mockedProjectModel.deleteProjectById.mockRejectedValue(error);

      await deleteProject(req, res, next);

      const forwardedError = next.mock.calls[0][0] as AppError;

      expect(forwardedError).toBeInstanceOf(AppError);
      expect(forwardedError.statusCode).toBe(409);
      expect(forwardedError.code).toBe("PROJECT_HAS_TASKS");
      expect(forwardedError.message).toBe(
        "Project cannot be deleted while it still has tasks.",
      );
    });
  });
});
