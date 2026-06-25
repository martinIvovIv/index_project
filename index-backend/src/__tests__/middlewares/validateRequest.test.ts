import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { validateRequest } from "../../middlewares/validateRequest";

function createResponse() {
  return {} as Response;
}

describe("validateRequest", () => {
  it("calls next and updates the parsed body", () => {
    const middleware = validateRequest(
      z.object({
        body: z.object({
          name: z.string().trim().min(1),
        }),
      }),
    );

    const req = {
      body: { name: "  Client onboarding  " },
      params: {},
      query: {},
    } as Request;
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);

    expect(req.body).toEqual({ name: "Client onboarding" });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("throws when validation fails", () => {
    const middleware = validateRequest(
      z.object({
        body: z.object({
          name: z.string().min(1),
        }),
      }),
    );

    const req = {
      body: { name: "" },
      params: {},
      query: {},
    } as Request;
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    expect(() => middleware(req, res, next)).toThrow();
    expect(next).not.toHaveBeenCalled();
  });
});
