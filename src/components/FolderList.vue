//components/FolderList.vue
<template>
  <div class="folder-list-container">
    <FolderActions ref="folderActionsRef" />

    <div class="folder-list-view">
      <div
        v-for="item in items"
        :key="item.id"
        class="list-item"
        :class="{
          'is-folder': item.type === 'folder',
          'is-file': item.type === 'file',
          'selected': selectedItem?.id === item.id
        }"
        @click="handleItemClick(item)"
        @contextmenu="handleContextMenu($event, item)"
      >
        <span class="item-icon">
          {{ item.type === 'folder' ? '📁' : ' ' }}
        </span>
        <span class="item-name">{{ item.name }}</span>
      </div>

      <div v-if="items.length === 0" class="empty-state">
        <p>This folder is empty</p>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FolderActions from './FolderActions.vue'
import type { FolderType } from '@/types'

const props = defineProps<{
  items: FolderType[]
}>()

const emit = defineEmits<{
  (e: 'select-item', item: FolderType): void
}>()

const folderActionsRef = ref<InstanceType<typeof FolderActions> | null>(null)
const selectedItem = ref<FolderType | null>(null)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const handleItemClick = (item: FolderType) => {
  selectedItem.value = item
  emit('select-item', item)
}

const handleContextMenu = (event: MouseEvent, item: FolderType) => {
  if (item.type === 'folder' && folderActionsRef.value) {
    event.preventDefault()
    selectedItem.value = item
    folderActionsRef.value.showContextMenuForFolder(event, item)
  }
}

const handleCreateFolder = () => {
  if (folderActionsRef.value) {
    folderActionsRef.value.showCreateModal = true
  }
}
</script>

<style scoped>
.folder-list-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.folder-list-view {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-grow: 1;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  user-select: none;
}

.list-item:hover {
  background-color: #f3f4f6;
}

.list-item.selected {
  background-color: #e5e7eb;
}

.item-icon {
  margin-right: 0.75rem;
}

.item-name {
  flex-grow: 1;
}

.item-date {
  color: #6b7280;
  font-size: 0.875rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: #6b7280;
  text-align: center;
}

.create-folder-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.create-folder-btn:hover {
  background-color: #e5e7eb;
}

.is-folder {
  font-weight: 500;
}

.is-file {
  color: #6b7280;
}
</style>
