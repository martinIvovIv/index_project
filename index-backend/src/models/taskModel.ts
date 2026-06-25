import { pool } from "../db/pool";
import type { Task, TaskRow, TaskStatus } from "../types";

/**
 * Simple helper for mapping a db row to obj
 */
function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    status: row.status,
    createdAt: row.created_at.toISOString(),
  };
}

export async function createTask(projectId: string, title: string): Promise<Task> {
  const result = await pool.query<TaskRow>(
    `
      INSERT INTO tasks (project_id, title)
      VALUES ($1, $2)
      RETURNING id, project_id, title, status, created_at
    `,
    [projectId, title],
  );

  return mapTask(result.rows[0]);
}

export async function listTasksByProject(
  projectId: string,
  status?: TaskStatus,
): Promise<Task[]> {
  const result = status
    ? await pool.query<TaskRow>(
        `
          SELECT id, project_id, title, status, created_at
          FROM tasks
          WHERE project_id = $1 AND status = $2
          ORDER BY created_at DESC
        `,
        [projectId, status],
      )
    : await pool.query<TaskRow>(
        `
          SELECT id, project_id, title, status, created_at
          FROM tasks
          WHERE project_id = $1
          ORDER BY created_at DESC
        `,
        [projectId],
      );

  return result.rows.map(mapTask);
}

export async function updateTaskStatus(
  projectId: string,
  taskId: string,
  status: TaskStatus,
): Promise<Task | null> {
  const result = await pool.query<TaskRow>(
    `
      UPDATE tasks
      SET status = $3
      WHERE project_id = $1 AND id = $2
      RETURNING id, project_id, title, status, created_at
    `,
    [projectId, taskId, status],
  );

  return result.rows[0] ? mapTask(result.rows[0]) : null;
}

