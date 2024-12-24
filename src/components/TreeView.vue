<!-- src/components/TreeView.vue -->
<template>
  <div class="tree-view">
    <ul class="folder-list">
      <TreeNode
        v-for="folder in folders"
        :key="folder.id"
        :folder="folder"
        :selected-folder="selectedFolder"
        @select-folder="$emit('select-folder', $event)"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
import TreeNode from './TreeNode.vue'
import type { FolderType } from '@/types'

defineProps<{
  folders: FolderType[]
  selectedFolder: FolderType | null
}>()

defineEmits<{
  (e: 'select-folder', folder: FolderType): void
}>()
</script>

<style scoped>
.tree-view {
  padding: 0.5rem;
}

.folder-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
