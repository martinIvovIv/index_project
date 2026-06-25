import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useProjectStore } from '../projectStore'
import type { Project, Task } from '@/types/types'
import { apiRequest } from '@/utils/apiRequestFunction'

vi.mock('@/utils/apiRequestFunction', () => ({
  apiRequest: vi.fn(),
}))

const mockedApiRequest = vi.mocked(apiRequest)

const projectA: Project = {
  id: 'project-a',
  name: 'Alpha',
  createdAt: '2026-06-25T10:00:00.000Z',
}

const projectB: Project = {
  id: 'project-b',
  name: 'Beta',
  createdAt: '2026-06-26T10:00:00.000Z',
}

const taskA: Task = {
  id: 'task-a',
  projectId: 'project-a',
  title: 'First task',
  status: 'todo',
  createdAt: '2026-06-25T10:00:00.000Z',
}

const taskB: Task = {
  id: 'task-b',
  projectId: 'project-a',
  title: 'Updated task',
  status: 'done',
  createdAt: '2026-06-25T11:00:00.000Z',
}

describe('projectStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockedApiRequest.mockReset()
  })

  it('fetches projects and updates getters', async () => {
    mockedApiRequest.mockResolvedValue({ data: [projectA, projectB] })

    const store = useProjectStore()
    const result = await store.fetchProjects()

    expect(mockedApiRequest).toHaveBeenCalledWith()
    expect(result).toEqual([projectA, projectB])
    expect(store.projects).toEqual([projectA, projectB])
    expect(store.projectCount).toBe(2)
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('stores a fetchProjects error and rethrows it', async () => {
    mockedApiRequest.mockRejectedValue(new Error('Failed to fetch projects'))

    const store = useProjectStore()

    await expect(store.fetchProjects()).rejects.toThrow('Failed to fetch projects')
    expect(store.error).toBe('Failed to fetch projects')
    expect(store.isLoading).toBe(false)
  })

  it('creates a project and adds it to the beginning of the list', async () => {
    mockedApiRequest.mockResolvedValue({ data: projectB })

    const store = useProjectStore()
    store.projects = [projectA]

    const createdProject = await store.createProject(projectB.name)

    expect(mockedApiRequest).toHaveBeenCalledWith('', {
      method: 'POST',
      body: JSON.stringify({ name: projectB.name }),
    })
    expect(createdProject).toEqual(projectB)
    expect(store.projects).toEqual([projectB, projectA])
  })

  it('deletes a project, clears its tasks, and resets the selection', async () => {
    mockedApiRequest.mockResolvedValue(undefined)

    const store = useProjectStore()
    store.projects = [projectA, projectB]
    store.tasksByProject = {
      'project-a': [taskA],
      'project-b': [],
    }
    store.selectedProjectId = 'project-a'

    await store.deleteProject('project-a')

    expect(mockedApiRequest).toHaveBeenCalledWith('/project-a', {
      method: 'DELETE',
    })
    expect(store.projects).toEqual([projectB])
    expect(store.tasksByProject['project-a']).toBeUndefined()
    expect(store.selectedProjectId).toBeNull()
  })

  it('fetches tasks for a project and keeps them under that project id', async () => {
    mockedApiRequest.mockResolvedValue({ data: [taskA] })

    const store = useProjectStore()
    const result = await store.fetchTasks('project-a', 'todo')

    expect(mockedApiRequest).toHaveBeenCalledWith('/project-a/tasks?status=todo')
    expect(result).toEqual([taskA])
    expect(store.getTasksForProject('project-a')).toEqual([taskA])
  })

  it('creates a task and prepends it to the project task list', async () => {
    mockedApiRequest.mockResolvedValue({ data: taskA })

    const store = useProjectStore()

    const createdTask = await store.createTask('project-a', taskA.title)

    expect(mockedApiRequest).toHaveBeenCalledWith('/project-a/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: taskA.title }),
    })
    expect(createdTask).toEqual(taskA)
    expect(store.tasksByProject['project-a']).toEqual([taskA])
  })

  it('updates a task status in the current project task list', async () => {
    mockedApiRequest.mockResolvedValue({ data: taskB })

    const store = useProjectStore()
    store.tasksByProject = {
      'project-a': [taskA],
    }

    const updatedTask = await store.updateTaskStatus('project-a', 'task-a', 'done')

    expect(mockedApiRequest).toHaveBeenCalledWith('/project-a/tasks/task-a/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'done' }),
    })
    expect(updatedTask).toEqual(taskB)
    expect(store.tasksByProject['project-a']).toEqual([taskB])
  })

  it('returns the selected project and selected tasks for the active project', () => {
    const store = useProjectStore()
    store.projects = [projectA, projectB]
    store.tasksByProject = {
      'project-a': [taskA],
    }

    store.setSelectedProject('project-a')

    expect(store.selectedProject).toEqual(projectA)
    expect(store.selectedTasks).toEqual([taskA])
  })

  it('clears the current error', () => {
    const store = useProjectStore()
    store.error = 'Something went wrong'

    store.clearError()

    expect(store.error).toBeNull()
  })
})
