<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProjectStore } from '@/stores/projectStore'

const props = defineProps<{
  projectId: string
}>()

const projectStore = useProjectStore()

const dialog = ref(false)
const taskTitle = ref('')
const isSubmitting = ref(false)

const isDisabled = computed(() => !taskTitle.value.trim() || isSubmitting.value)

async function submit() {
  const title = taskTitle.value.trim()
  if (!title) return

  isSubmitting.value = true

  try {
    await projectStore.createTask(props.projectId, title)
    taskTitle.value = ''
    dialog.value = false
  } catch {
    // The store already exposes the error state.
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="440">
    <template #activator="{ props: activatorProps }">
      <v-btn v-bind="activatorProps" color="primary" size="small" variant="flat"> Add task </v-btn>
    </template>

    <v-card>
      <v-card-title>Create task</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="taskTitle"
          autofocus
          hide-details
          label="Task title"
          class="text-field"
          variant="outlined"
          @keydown.enter.prevent="submit"
        />
      </v-card-text>
      <v-card-actions class="px-6 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
        <v-btn :disabled="isDisabled" :loading="isSubmitting" color="primary" @click="submit">
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style>
.toolbar-action {
  margin-right: 1rem;
}

.text-field label {
  margin-left: 1rem;
}
</style>
