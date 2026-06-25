<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useProjectStore } from '@/stores/projectStore'
import type { Task, TaskStatus } from '@/types/types'
import { formatDate } from './helpers'
import ProjectCreateDialog from './ProjectCreateDialog.vue'
import TaskCreateDialog from './TaskCreateDialog.vue'

const projectStore = useProjectStore()
const { projects, tasksByProject, isLoading, error } = storeToRefs(projectStore)

const STATUS_OPTIONS = [
  { title: 'Todo', value: 'todo' },
  { title: 'Progress', value: 'in_progress' },
  { title: 'Done', value: 'done' },
] as const

const openPanels = ref<number[]>([])
const loadedTasks = ref<Record<string, boolean>>({})
const taskDraftStatus = ref<Record<string, TaskStatus>>({})
const savingTaskIds = ref<Record<string, boolean>>({})

const initialLoading = computed(() => isLoading.value && projects.value.length === 0)

function syncTaskDrafts(tasks: Task[]) {
  for (const task of tasks) {
    taskDraftStatus.value[task.id] = task.status
  }
}

async function loadTasksForProject(projectId: string) {
  if (loadedTasks.value[projectId]) return
  const tasks = await projectStore.fetchTasks(projectId)
  syncTaskDrafts(tasks)
  loadedTasks.value[projectId] = true
}

function hasStatusChanged(task: Task) {
  return (taskDraftStatus.value[task.id] ?? task.status) !== task.status
}

async function saveTaskStatus(projectId: string, task: Task) {
  if (!hasStatusChanged(task)) return
  savingTaskIds.value[task.id] = true
  try {
    const updated = await projectStore.updateTaskStatus(
      projectId,
      task.id,
      taskDraftStatus.value[task.id] ?? task.status,
    )
    taskDraftStatus.value[task.id] = updated.status
  } finally {
    savingTaskIds.value[task.id] = false
  }
}

watch(openPanels, async (indices, prevIndices) => {
  const prev = new Set(prevIndices ?? [])
  for (const index of indices.filter((i) => !prev.has(i))) {
    const project = projects.value[index]
    if (!project) continue
    projectStore.setSelectedProject(project.id)
    await loadTasksForProject(project.id)
  }
})

onMounted(() => projectStore.fetchProjects())
</script>

<template>
  <v-sheet class="sheet" elevation="2" rounded="lg">
    <v-toolbar color="transparent" density="comfortable">
      <v-toolbar-title class="projects-title">Projects</v-toolbar-title>
      <template #append>
        <ProjectCreateDialog />
      </template>
    </v-toolbar>

    <v-divider />

    <div v-if="initialLoading" class="pa-4">
      <v-skeleton-loader
        type="heading, list-item-two-line, list-item-two-line, list-item-two-line"
      />
    </div>

    <v-alert v-else-if="error" class="ma-4" density="comfortable" type="error" variant="tonal">
      {{ error }}
    </v-alert>

    <v-alert
      v-else-if="!isLoading && projects.length === 0"
      class="ma-4"
      density="comfortable"
      type="info"
      variant="tonal"
    >
      No projects yet.
    </v-alert>

    <v-expansion-panels v-else v-model="openPanels" class="pa-4" multiple variant="accordion">
      <v-expansion-panel
        v-for="(project, index) in projects"
        :key="project.id"
        :value="index"
        class="mb-3"
      >
        <v-expansion-panel-title>
          <div class="d-flex w-100 align-center justify-space-between pr-4">
            <span>{{ project.name }}</span>
            <span class="text-medium-emphasis">{{ formatDate(project.createdAt) }}</span>
          </div>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <v-progress-circular
            v-if="isLoading && !loadedTasks[project.id]"
            color="primary"
            indeterminate
            size="22"
            width="2"
          />

          <v-list
            v-else-if="(tasksByProject[project.id] ?? []).length > 0"
            class="px-0"
            density="compact"
          >
            <template v-for="task in tasksByProject[project.id]" :key="task.id">
              <v-list-item class="task-row px-0">
                <v-list-item-title>{{ task.title }}</v-list-item-title>
                <template #append>
                  <div class="task-actions">
                    <v-select
                      v-model="taskDraftStatus[task.id]"
                      :items="STATUS_OPTIONS"
                      class="task-status-select"
                      density="compact"
                      hide-details
                      item-title="title"
                      item-value="value"
                      variant="plain"
                    />
                    <v-btn
                      :disabled="!hasStatusChanged(task) || savingTaskIds[task.id]"
                      :loading="savingTaskIds[task.id]"
                      color="secondary"
                      size="small"
                      variant="tonal"
                      @click="saveTaskStatus(project.id, task)"
                    >
                      Save
                    </v-btn>
                  </div>
                </template>
              </v-list-item>
              <v-divider :thickness="2" />
            </template>

            <div class="pt-3">
              <TaskCreateDialog :project-id="project.id" />
            </div>
          </v-list>

          <div v-else class="text-body-2 text-medium-emphasis">
            No tasks yet.
            <div class="pt-3">
              <TaskCreateDialog :project-id="project.id" />
            </div>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-sheet>
</template>

<style scoped>
.sheet {
  background-color: var(--color-sheet-box);
  margin-inline: auto;
  max-width: 680px;
  width: 100%;
}

.projects-title {
  padding-left: 1rem;
}

.task-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  width: 100%;
}

.task-actions {
  align-items: center;
  display: flex;
  gap: 12px;
}

.task-status-select {
  min-width: 140px;
}

@media (max-width: 640px) {
  .task-row {
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding-bottom: 1rem;
  }
}
</style>
