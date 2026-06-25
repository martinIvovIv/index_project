<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProjectStore } from '@/stores/projectStore'

const projectStore = useProjectStore()

const dialog = ref(false)
const projectName = ref('')
const isSubmitting = ref(false)

const isDisabled = computed(() => !projectName.value.trim() || isSubmitting.value)

async function submit() {
  const name = projectName.value.trim()
  if (!name) return

  isSubmitting.value = true

  try {
    await projectStore.createProject(name)
    projectName.value = ''
    dialog.value = false
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="440">
    <template #activator="{ props }">
      <v-btn v-bind="props" color="primary" size="small" variant="flat" class="toolbar-action">
        New project
      </v-btn>
    </template>

    <v-card>
      <v-card-title>Create project</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="projectName"
          autofocus
          hide-details
          label="Project name"
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
