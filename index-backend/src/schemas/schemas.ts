import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { taskStatuses } from "../types";

extendZodWithOpenApi(z);

export { z };

export const projectSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    createdAt: z.string().datetime(),
  })
  .openapi("Project");

export const taskStatusSchema = z.enum(taskStatuses).openapi("TaskStatus");

export const taskSchema = z
  .object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    title: z.string(),
    status: taskStatusSchema,
    createdAt: z.string().datetime(),
  })
  .openapi("Task");

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(120),
  }),
});

export const deleteProjectSchema = z.object({
  params: z.object({
    projectId: z.string().uuid(),
  }),
});

export const projectParamsSchema = z.object({
  params: z.object({
    projectId: z.string().uuid(),
  }),
});

export const createTaskSchema = z.object({
  params: z.object({
    projectId: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().trim().min(1).max(200),
  }),
});

export const listTasksSchema = z.object({
  params: z.object({
    projectId: z.string().uuid(),
  }),
  query: z.object({
    status: taskStatusSchema.optional(),
  }),
});

export const updateTaskStatusSchema = z.object({
  params: z.object({
    projectId: z.string().uuid(),
    taskId: z.string().uuid(),
  }),
  body: z.object({
    status: taskStatusSchema,
  }),
});

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});
