import { pool } from "../db/pool";
import type { Project, ProjectRow } from "../types";

/**
 * Simple helper for mapping a db row to obj
 */
function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at.toISOString(),
  };
}

export async function createProject(name: string): Promise<Project> {
  const result = await pool.query<ProjectRow>(
    `
      INSERT INTO projects (name)
      VALUES ($1)
      RETURNING id, name, created_at
    `,
    [name],
  );

  return mapProject(result.rows[0]);
}

export async function listProjects(): Promise<Project[]> {
  const result = await pool.query<ProjectRow>(`
    SELECT id, name, created_at
    FROM projects
    ORDER BY created_at DESC
  `);

  return result.rows.map(mapProject);
}

export async function findProjectById(id: string): Promise<Project | null> {
  const result = await pool.query<ProjectRow>(
    `
      SELECT id, name, created_at
      FROM projects
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] ? mapProject(result.rows[0]) : null;
}

export async function deleteProjectById(id: string): Promise<void> {
  const result = await pool.query<ProjectRow>(
    `
      DELETE FROM projects
      WHERE id = $1
      RETURNING id, name, created_at
    `,
    [id],
  );

  if (!result.rows[0]) {
    throw new Error("PROJECT_NOT_FOUND");
  }
}
