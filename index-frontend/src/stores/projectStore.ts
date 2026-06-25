import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { ApiResponse, Project, Task, TaskStatus } from '@/types/types'
import { apiRequest } from '@/utils/apiRequestFunction'

export const useProjectStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const tasksByProject = ref<Record<string, Task[]>>({})
  const selectedProjectId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // getters
  const projectCount = computed(() => projects.value.length)

  const selectedProject = computed(
    () => projects.value.find((project) => project.id === selectedProjectId.value) ?? null,
  )

  const selectedTasks = computed(() => {
    if (!selectedProjectId.value) return []
    return tasksByProject.value[selectedProjectId.value] ?? []
  })

  function getTasksForProject(projectId: string) {
    return tasksByProject.value[projectId] ?? []
  }

  function setSelectedProject(projectId: string | null) {
    selectedProjectId.value = projectId
  }

  function clearError() {
    error.value = null
  }

  // actions
  async function fetchProjects() {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiRequest<ApiResponse<Project[]>>()
      projects.value = response.data

      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch projects'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createProject(name: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiRequest<ApiResponse<Project>>('', {
        method: 'POST',
        body: JSON.stringify({ name }),
      })

      projects.value = [response.data, ...projects.value]

      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create project'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteProject(projectId: string) {
    isLoading.value = true
    error.value = null

    try {
      await apiRequest<void>(`/${projectId}`, {
        method: 'DELETE',
      })

      projects.value = projects.value.filter((project) => project.id !== projectId)
      delete tasksByProject.value[projectId]

      if (selectedProjectId.value === projectId) {
        selectedProjectId.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete project'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTasks(projectId: string, status?: TaskStatus) {
    isLoading.value = true
    error.value = null

    try {
      const query = status ? `?status=${encodeURIComponent(status)}` : ''
      const response = await apiRequest<ApiResponse<Task[]>>(`/${projectId}/tasks${query}`)

      tasksByProject.value[projectId] = response.data

      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch tasks'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createTask(projectId: string, title: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiRequest<ApiResponse<Task>>(`/${projectId}/tasks`, {
        method: 'POST',
        body: JSON.stringify({ title }),
      })

      tasksByProject.value[projectId] = [response.data, ...(tasksByProject.value[projectId] ?? [])]

      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create task'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateTaskStatus(projectId: string, taskId: string, status: TaskStatus) {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiRequest<ApiResponse<Task>>(`/${projectId}/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })

      const currentTasks = tasksByProject.value[projectId] ?? []
      tasksByProject.value[projectId] = currentTasks.map((task) =>
        task.id === taskId ? response.data : task,
      )

      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update task status'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    projects,
    tasksByProject,
    selectedProjectId,
    isLoading,
    loading: isLoading,
    error,

    projectCount,
    selectedProject,
    selectedTasks,
    getTasksForProject,
    setSelectedProject,
    clearError,

    fetchProjects,
    createProject,
    addProject: createProject,
    deleteProject,
    removeProject: deleteProject,
    fetchTasks,
    createTask,
    addTask: createTask,
    updateTaskStatus,
  }
})

export type ProjectStore = ReturnType<typeof useProjectStore>
