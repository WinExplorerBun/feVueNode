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
    >
      <span class="toggle-icon" @click.stop="toggleExpanded" v-if="hasChildren">
        {{ isExpanded ? '▼' : '▶' }}
      </span>
      <span class="toggle-icon" v-else> 　 </span>
      <span class="folder-icon">📁</span>
      <span class="folder-name">{{ folder.name }}</span>
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
import { ref, computed } from 'vue'
import type { FolderType } from '@/types'

const props = defineProps<{
  folder: FolderType
  selectedFolder: FolderType | null
}>()

const emit = defineEmits<{
  (e: 'select-folder', folder: FolderType): void
}>()

const isExpanded = ref(false)

const hasChildren = computed(() => {
  return props.folder.children && props.folder.children.length > 0
})

const isSelected = computed(() => {
  return props.selectedFolder?.id === props.folder.id
})

const handleClick = () => {
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
</script>

<style scoped>
.tree-node {
  user-select: none;
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
