import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import {
  createProjectSchema,
  createTaskSchema,
  deleteProjectSchema,
  errorResponseSchema,
  listTasksSchema,
  projectSchema,
  taskSchema,
  updateTaskStatusSchema,
  z,
} from "../schemas/schemas";

const registry = new OpenAPIRegistry();

const projectResponseSchema = z.object({ data: projectSchema });
const projectsResponseSchema = z.object({ data: z.array(projectSchema) });
const taskResponseSchema = z.object({ data: taskSchema });
const tasksResponseSchema = z.object({ data: z.array(taskSchema) });

function jsonResponse(schema: z.ZodTypeAny, description: string) {
  return {
    description,
    content: {
      "application/json": { schema },
    },
  };
}

registry.registerPath({
  method: "get",
  path: "/api/v1/projects",
  tags: ["Projects"],
  summary: "List projects",
  responses: {
    200: jsonResponse(projectsResponseSchema, "Projects returned successfully."),
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/projects",
  tags: ["Projects"],
  summary: "Create project",
  request: {
    body: {
      content: {
        "application/json": { schema: createProjectSchema.shape.body },
      },
    },
  },
  responses: {
    201: jsonResponse(projectResponseSchema, "Project created successfully."),
    400: jsonResponse(errorResponseSchema, "Validation error."),
    409: jsonResponse(errorResponseSchema, "Project name already exists."),
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/v1/projects/{projectId}",
  tags: ["Projects"],
  summary: "Delete project",
  request: {
    params: deleteProjectSchema.shape.params,
  },
  responses: {
    204: {
      description: "Project deleted successfully.",
    },
    400: jsonResponse(errorResponseSchema, "Validation error."),
    404: jsonResponse(errorResponseSchema, "Project not found."),
    409: jsonResponse(
      errorResponseSchema,
      "Project still has tasks and cannot be deleted.",
    ),
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/projects/{projectId}/tasks",
  tags: ["Tasks"],
  summary: "List project tasks",
  request: {
    params: listTasksSchema.shape.params,
    query: listTasksSchema.shape.query,
  },
  responses: {
    200: jsonResponse(tasksResponseSchema, "Tasks returned successfully."),
    400: jsonResponse(errorResponseSchema, "Validation error."),
    404: jsonResponse(errorResponseSchema, "Project not found."),
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/projects/{projectId}/tasks",
  tags: ["Tasks"],
  summary: "Create task",
  request: {
    params: createTaskSchema.shape.params,
    body: {
      content: {
        "application/json": { schema: createTaskSchema.shape.body },
      },
    },
  },
  responses: {
    201: jsonResponse(taskResponseSchema, "Task created successfully."),
    400: jsonResponse(errorResponseSchema, "Validation error."),
    404: jsonResponse(errorResponseSchema, "Project not found."),
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/v1/projects/{projectId}/tasks/{taskId}/status",
  tags: ["Tasks"],
  summary: "Update task status",
  request: {
    params: updateTaskStatusSchema.shape.params,
    body: {
      content: {
        "application/json": { schema: updateTaskStatusSchema.shape.body },
      },
    },
  },
  responses: {
    200: jsonResponse(taskResponseSchema, "Task status updated successfully."),
    400: jsonResponse(errorResponseSchema, "Validation error."),
    404: jsonResponse(errorResponseSchema, "Project or task not found."),
  },
});

export function createOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Index Projects API",
      version: "1.0.0",
      description: "API for managing projects and tasks.",
    },
    servers: [{ url: "http://localhost:3003" }],
  });
}

