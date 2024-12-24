<template>
  <div class="explorer-container">
    <div class="explorer-header">
      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search folders..."
          @input="handleSearch"
        />
      </div>
    </div>

    <div class="explorer-content">
      <!-- Left Panel -->
      <div class="folder-tree" :class="{ loading: folderStore.loading }">
        <TreeView
          :folders="folderStore.folders"
          :selectedFolder="folderStore.selectedFolder"
          @select-folder="handleFolderSelect"
        />
        <div v-if="folderStore.loading" class="loading-overlay">Loading...</div>
      </div>

      <!-- Right Panel -->
      <div class="folder-contents">
        <div v-if="folderStore.selectedFolder" class="content-header">
          <h2>{{ folderStore.selectedFolder.name }}</h2>
          <span class="folder-path">{{ folderStore.selectedFolder.path }}</span>
        </div>

        <div class="content-list" :class="{ loading: folderStore.loading }">
          <FolderList
            v-if="folderStore.selectedFolder"
            :items="currentContents"
            @select-item="handleItemSelect"
          />
          <div v-else class="no-selection">Please select a folder from the tree</div>
          <button
            class="create-folder-btn"
            @click="handleCreateFolder"
          >
            Create New Folder
          </button>
        </div>
      </div>
    </div>

    <div v-if="folderStore.error" class="error-message">
      {{ folderStore.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TreeView from './TreeView.vue'
import FolderList from './FolderList.vue'
import { useFolderStore } from '@/stores/folderStore'
import type { FolderType } from '@/types'
import FolderActions from "./FolderActions.vue";

const folderStore = useFolderStore()
const currentContents = ref<FolderType[]>([])
const searchQuery = ref('')
const folderActionsRef = ref<InstanceType<typeof FolderActions> | null>(null)
const handleCreateFolder = () => {
  if (folderActionsRef.value) {
    folderActionsRef.value.showCreateModal = true
  }
}
const handleFolderSelect = async (folder: FolderType) => {
  folderStore.setSelectedFolder(folder)
  const contents = await folderStore.getFolderContents(folder.id)
  currentContents.value = contents
}

const handleItemSelect = (item: FolderType) => {
  if (item.type === 'folder') {
    handleFolderSelect(item)
  }
}

const handleSearch = () => {
  // Implement search functionality
  console.log('Searching:', searchQuery.value)
}

onMounted(async () => {
  await folderStore.fetchFolderStructure()
})
</script>

<style scoped>
.explorer-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.explorer-header {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.search-bar input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
}

.explorer-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.folder-tree {
  width: 300px;
  border-right: 1px solid #e2e8f0;
  overflow-y: auto;
  position: relative;
}

.folder-contents {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.folder-path {
  font-size: 0.875rem;
  color: #666;
}

.content-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.no-selection {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-message {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  padding: 1rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 0.375rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>

