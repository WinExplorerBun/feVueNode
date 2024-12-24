//components/FolderAction.vue
<template>
  <div class="folder-actions">
    <!-- Create Folder Button -->
    <button
      class="action-button"
      @click="showCreateModal = true"
      :disabled="loading"
    >
      <span class="icon">📁</span>
      New Folder
    </button>

    <!-- Create Folder Modal -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal">
        <h3>Create New Folder</h3>
        <input
          v-model="newFolderName"
          placeholder="Folder name"
          @keyup.enter="handleCreateFolder"
        />
        <div class="modal-actions">
          <button @click="showCreateModal = false">Cancel</button>
          <button
            @click="handleCreateFolder"
            :disabled="!newFolderName || loading"
          >
            Create
          </button>
        </div>
      </div>
    </div>

    <!-- Rename Folder Modal -->
    <div v-if="showRenameModal" class="modal-overlay">
      <div class="modal">
        <h3>Rename Folder</h3>
        <input
          v-model="newFolderName"
          :placeholder="selectedFolder?.name"
          @keyup.enter="handleRenameFolder"
        />
        <div class="modal-actions">
          <button @click="showRenameModal = false">Cancel</button>
          <button
            @click="handleRenameFolder"
            :disabled="!newFolderName || loading"
          >
            Rename
          </button>
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <div
      v-if="showContextMenu"
      class="context-menu"
      :style="{ top: contextMenuPos.y + 'px', left: contextMenuPos.x + 'px' }"
    >
      <div class="context-menu-item" @click="handleRenameClick">
        <span class="icon">✏️</span> Rename
      </div>
      <div class="context-menu-item delete" @click="handleDeleteClick">
        <span class="icon">🗑️</span> Delete
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <h3>Delete Folder</h3>
        <p>Are you sure you want to delete "{{ selectedFolder?.name }}"?</p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false">Cancel</button>
          <button
            class="delete"
            @click="handleDeleteFolder"
            :disabled="loading"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useFolderStore } from '@/stores/folderStore'
import type { FolderType } from '@/types'

const folderStore = useFolderStore()

// State
const showCreateModal = ref(false)
const showRenameModal = ref(false)
const showDeleteModal = ref(false)
const showContextMenu = ref(false)
const contextMenuPos = ref({ x: 0, y: 0 })
const newFolderName = ref('')
const selectedFolder = ref<FolderType | null>(null)
const loading = ref(false)

// Methods
const handleCreateFolder = async () => {
  if (!newFolderName.value) return

  try {
    loading.value = true
    await folderStore.createFolder(
      newFolderName.value,
      folderStore.selectedFolder?.id || null
    )
    showCreateModal.value = false
    newFolderName.value = ''
  } catch (error) {
    console.error('Error creating folder:', error)
  } finally {
    loading.value = false
  }
}

const handleRenameClick = () => {
  showContextMenu.value = false
  showRenameModal.value = true
}

const handleRenameFolder = async () => {
  if (!newFolderName.value || !selectedFolder.value) return

  try {
    loading.value = true
    await folderStore.renameFolder(selectedFolder.value.id, newFolderName.value)
    showRenameModal.value = false
    newFolderName.value = ''
  } catch (error) {
    console.error('Error renaming folder:', error)
  } finally {
    loading.value = false
  }
}

const handleDeleteClick = () => {
  showContextMenu.value = false
  showDeleteModal.value = true
}

const handleDeleteFolder = async () => {
  if (!selectedFolder.value) return

  try {
    loading.value = true
    await folderStore.deleteFolder(selectedFolder.value.id)
    showDeleteModal.value = false
  } catch (error) {
    console.error('Error deleting folder:', error)
  } finally {
    loading.value = false
  }
}

const showContextMenuForFolder = (event: MouseEvent, folder: FolderType) => {
  event.preventDefault()
  selectedFolder.value = folder
  contextMenuPos.value = { x: event.clientX, y: event.clientY }
  showContextMenu.value = true
}

// Close context menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (showContextMenu.value) {
    showContextMenu.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Expose the showContextMenuForFolder method
defineExpose({
  showContextMenuForFolder
})
</script>

<style scoped>
.folder-actions {
  position: relative;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.action-button:hover {
  background: #f5f5f5;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 8px;
  min-width: 300px;
}

.modal input {
  width: 100%;
  padding: 8px;
  margin: 16px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 0;
  min-width: 150px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.context-menu-item {
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.context-menu-item:hover {
  background: #f5f5f5;
}

.context-menu-item.delete {
  color: #dc2626;
}

.delete {
  color: #dc2626;
}

.icon {
  font-size: 1.2em;
}
</style>
