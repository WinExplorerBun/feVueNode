<!-- src/components/ExplorerView.vue -->
<template>
  <div class="explorer-container">
    <div class="left-panel">
      <div class="panel-header">
        <h3>Folders</h3>
        <button class="new-folder-btn" @click="showCreateRootFolderModal">
          <span class="icon">📁</span> New Folder
        </button>
      </div>
      <TreeView
          :folders="folderStructure"
          :selected-folder="selectedFolder"
          @select-folder="handleFolderSelect"
      />
    </div>

    <div class="right-panel">
      <div class="panel-header">
        <h3>{{ selectedFolder?.name || 'Contents' }}</h3>
      </div>
      <FolderList
          :items="currentFolderContents"
          @select-item="handleItemSelect"
      />
    </div>

    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal">
        <h3>Create New Folder</h3>
        <input
            v-model="newFolderName"
            placeholder="Folder name"
            @keyup.enter="handleCreateRootFolder"
        />
        <div class="modal-actions">
          <button @click="showCreateModal = false">Cancel</button>
          <button
              @click="handleCreateRootFolder"
              :disabled="!newFolderName || isLoading"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useFolderStore } from '@/stores/folderStore'
import TreeView from './TreeView.vue'
import FolderList from './FolderList.vue'
import type { FolderType } from '@/types'

const folderStore = useFolderStore()
const selectedFolder = ref<FolderType | null>(null)
const currentFolderContents = ref<FolderType[]>([])
const showCreateModal = ref(false)
const newFolderName = ref('')
const isLoading = ref(false)

// Computed property for folder structure
const folderStructure = computed(() => folderStore.folders)

// Initialize the explorer
onMounted(async () => {
  await refreshFolderStructure()
})

// Fetch and refresh folder structure
async function refreshFolderStructure() {
  isLoading.value = true
  try {
    await folderStore.fetchFolderStructure()
  } catch (error) {
    console.error('Failed to fetch folder structure:', error)
  } finally {
    isLoading.value = false
  }
}

// Handle folder selection
async function handleFolderSelect(folder: FolderType) {
  selectedFolder.value = folder
  await loadFolderContents(folder.id)
}

// Handle item selection in the right panel
async function handleItemSelect(item: FolderType) {
  if (item.type === 'folder') {
    selectedFolder.value = item
    await loadFolderContents(item.id)
  }
}

// Load contents of selected folder
async function loadFolderContents(folderId: number) {
  isLoading.value = true
  try {
    const contents = await folderStore.getFolderContents(folderId)
    currentFolderContents.value = contents
  } catch (error) {
    console.error('Failed to load folder contents:', error)
    currentFolderContents.value = []
  } finally {
    isLoading.value = false
  }
}

// Show create root folder modal
function showCreateRootFolderModal() {
  showCreateModal.value = true
  newFolderName.value = ''
}

// Handle root folder creation
async function handleCreateRootFolder() {
  if (!newFolderName.value) return

  isLoading.value = true
  try {
    await folderStore.createFolder(newFolderName.value, null)
    showCreateModal.value = false
    newFolderName.value = ''
    await refreshFolderStructure()
  } catch (error) {
    console.error('Failed to create root folder:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.explorer-container {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f9fafb;
  overflow: hidden;
}

.left-panel, .right-panel {
  display: flex;
  flex-direction: column;
  background-color: white;
  height: 100%;
}

.left-panel {
  width: 300px;
  min-width: 250px;
  resize: horizontal;
  border-right: 1px solid #e5e7eb;
}

.right-panel {
  flex: 1;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: white;
}

.panel-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #374151;
}

.new-folder-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.new-folder-btn:hover {
  background-color: #e5e7eb;
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
  padding: 1.5rem;
  border-radius: 0.5rem;
  min-width: 300px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.modal h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: #374151;
}

.modal input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.modal-actions button {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-actions button:last-child {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.modal-actions button:last-child:hover {
  background-color: #2563eb;
}

.modal-actions button:first-child:hover {
  background-color: #f3f4f6;
}

.modal-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
