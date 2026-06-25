import type { NextFunction, Request, Response } from "express";
import { ZodError, z } from "zod";
import {
  AppError,
  errorHandler,
  notFoundHandler,
} from "../../middlewares/errorHandler";

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;
}

describe("notFoundHandler", () => {
  it("returns 404 for unknown routes", () => {
    const req = {
      method: "GET",
      path: "/missing",
    } as Request;
    const res = createResponse();

    notFoundHandler(req, res, jest.fn() as NextFunction);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "NOT_FOUND",
        message: "Route GET /missing was not found.",
      },
    });
  });
});

describe("errorHandler", () => {
  it.skip("returns AppError responses", () => {
    const req = {} as Request;
    const res = createResponse();
    const next = jest.fn() as NextFunction;
    const error = new AppError(409, "PROJECT_HAS_TASKS", "Project still has tasks.");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "PROJECT_HAS_TASKS",
        message: "Project still has tasks.",
      },
    });
  });

  it("returns validation responses for ZodError", () => {
    const req = {} as Request;
    const res = createResponse();
    const next = jest.fn() as NextFunction;
    const schema = z.object({ name: z.string().min(1) });
    const parsed = schema.safeParse({ name: "" });

    if (parsed.success) {
      throw new Error("Expected invalid schema parse.");
    }

    errorHandler(parsed.error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        details: parsed.error.flatten(),
      },
    });
  });

  it("returns 500 for unknown errors", () => {
    const req = {} as Request;
    const res = createResponse();
    const next = jest.fn() as NextFunction;
    const error = new Error("unexpected");

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
      },
    });

    consoleSpy.mockRestore();
  });
});
