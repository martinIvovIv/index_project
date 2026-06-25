import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { AnyZodObject } from "zod";

export function validateRequest(schema: AnyZodObject): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    req.body = result.body ?? req.body;

    next();
  };
}
