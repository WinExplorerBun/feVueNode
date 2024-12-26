<!-- src/components/TreeNode.vue -->
<template>
  <li class="tree-node">
    <div
        class="folder-item"
        :class="{
        selected: isSelected,
        'has-children': hasChildren,
      }"
        @click="handleClick"
        @contextmenu.prevent="showContextMenu"
    >
      <span class="toggle-icon" @click.stop="toggleExpanded" v-if="hasChildren">
        {{ isExpanded ? '▼' : '▶' }}
      </span>
      <span class="toggle-icon" v-else> 　 </span>
      <span class="folder-icon">📁</span>
      <span class="folder-name" v-if="!isEditing">{{ folder.name }}</span>
      <input
          v-else
          ref="renameInput"
          v-model="editedName"
          class="rename-input"
          @keyup.enter="handleRename"
          @keyup.esc="cancelRename"
          @blur="handleRename"
          @click.stop
      />
    </div>

    <!-- Context Menu -->
    <div
        v-if="showMenu"
        class="context-menu"
        :style="contextMenuStyle"
        @click.stop
    >
      <div class="menu-item" @click="startRename">
        <span class="menu-icon">✏️</span>
        Rename
      </div>
      <div class="menu-item delete" @click="confirmDelete">
        <span class="menu-icon">🗑️</span>
        Delete
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.stop>
      <div class="modal">
        <h3>Delete Folder</h3>
        <p>Are you sure you want to delete "{{ folder.name }}" and all its contents?</p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false">Cancel</button>
          <button class="delete-btn" @click="handleDelete">Delete</button>
        </div>
      </div>
    </div>

    <Transition name="slide">
      <ul v-if="hasChildren && isExpanded" class="subfolder-list">
        <TreeNode
            v-for="childFolder in folder.children"
            :key="childFolder.id"
            :folder="childFolder"
            :selected-folder="selectedFolder"
            @select-folder="$emit('select-folder', $event)"
        />
      </ul>
    </Transition>
  </li>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useFolderStore } from '@/stores/folderStore'
import type { FolderType } from '@/types'

const props = defineProps<{
  folder: FolderType
  selectedFolder: FolderType | null
}>()

const emit = defineEmits<{
  (e: 'select-folder', folder: FolderType): void
}>()

const folderStore = useFolderStore()
const isExpanded = ref(false)
const showMenu = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const isEditing = ref(false)
const editedName = ref('')
const renameInput = ref<HTMLInputElement | null>(null)
const showDeleteModal = ref(false)

const hasChildren = computed(() => {
  return props.folder.children && props.folder.children.length > 0
})

const isSelected = computed(() => {
  return props.selectedFolder?.id === props.folder.id
})

const contextMenuStyle = computed(() => ({
  top: menuPosition.value.y + 'px',
  left: menuPosition.value.x + 'px'
}))


const handleClick = () => {
  folderStore.setSelectedFolder(props.folder) // Update store
  emit('select-folder', props.folder)
  if (hasChildren.value) {
    isExpanded.value = true
  }
}

const toggleExpanded = (event: Event) => {
  event.stopPropagation()
  if (hasChildren.value) {
    isExpanded.value = !isExpanded.value
  }
}

const showContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  menuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  showMenu.value = true
}

const startRename = async () => {
  showMenu.value = false
  isEditing.value = true
  editedName.value = props.folder.name
  await nextTick()
  renameInput.value?.focus()
}

const handleRename = async () => {
  if (isEditing.value && editedName.value && editedName.value !== props.folder.name) {
    try {
      await folderStore.renameFolder(props.folder.id, editedName.value)
    } catch (error) {
      console.error('Failed to rename folder:', error)
    }
  }
  isEditing.value = false
}

const cancelRename = () => {
  isEditing.value = false
  editedName.value = props.folder.name
}

const confirmDelete = () => {
  showMenu.value = false
  showDeleteModal.value = true
}

const handleDelete = async () => {
  try {
    await folderStore.deleteFolder(props.folder.id)
    showDeleteModal.value = false
  } catch (error) {
    console.error('Failed to delete folder:', error)
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (showMenu.value) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.tree-node {
  user-select: none;
  position: relative;
}

.folder-item {
  display: flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  border-radius: 0.25rem;
  margin: 1px 0;
}

.folder-item:hover {
  background-color: #f3f4f6;
}

.folder-item.selected {
  background-color: #e5e7eb;
}

.toggle-icon {
  width: 20px;
  text-align: center;
  cursor: pointer;
  font-size: 0.75rem;
}

.folder-icon {
  margin-right: 0.5rem;
}

.folder-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #181818;
}

.rename-input {
  flex: 1;
  margin: -2px 0;
  padding: 2px 4px;
  border: 1px solid #3b82f6;
  border-radius: 0.25rem;
  outline: none;
  background: white;
  font-size: inherit;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  padding: 0.25rem 0;
  min-width: 150px;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.menu-item {
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #374151;
}

.menu-item:hover {
  background-color: #f3f4f6;
}

.menu-item.delete {
  color: #dc2626;
}

.menu-icon {
  font-size: 1rem;
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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal h3 {
  margin: 0 0 1rem 0;
  color: #374151;
}

.modal p {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
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
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-actions button:hover {
  background-color: #f3f4f6;
}

.modal-actions .delete-btn {
  background-color: #dc2626;
  color: white;
  border-color: #dc2626;
}

.modal-actions .delete-btn:hover {
  background-color: #b91c1c;
}

.subfolder-list {
  list-style: none;
  padding-left: 1.5rem;
  margin: 0;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
