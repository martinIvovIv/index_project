export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Task {
  id: string
  projectId: string
  title: string
  status: TaskStatus
  createdAt: string
}

export interface Project {
  id: string
  name: string
  createdAt: string
}

export type ApiResponse<T> = {
  data: T
}
