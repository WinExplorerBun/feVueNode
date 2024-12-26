import { defineStore } from 'pinia'
import axios from 'axios'
import type { FolderType, ApiResponse } from '@/types'

const API_BASE_URL = 'http://localhost:3000/api/v1'

export const useFolderStore = defineStore('folder', {
  state: () => ({
    folders: [] as FolderType[],
    selectedFolder: null as FolderType | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getFolderById: (state) => {
      return (id: number) => state.folders.find((folder) => folder.id === id)
    },
  },

  actions: {
    setSelectedFolder(folder: FolderType | null) {
      this.selectedFolder = folder;
    },

    async fetchFolderStructure() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get<ApiResponse<FolderType[]>>(
            `${API_BASE_URL}/folders`
        )
        this.folders = response.data.data
      } catch (error) {
        this.error = 'Failed to fetch folder structure'
        console.error('Error:', error)
      } finally {
        this.loading = false
      }
    },

    async getFolderContents(folderId: number) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get<ApiResponse<FolderType[]>>(
            `${API_BASE_URL}/folders/${folderId}/contents`
        )
        return response.data.data
      } catch (error) {
        this.error = 'Failed to fetch folder contents'
        console.error('Error:', error)
        return []
      } finally {
        this.loading = false
      }
    },

    async createFolder(name: string, parentId: number | null) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post<ApiResponse<FolderType>>(
            `${API_BASE_URL}/folders`,
            { name, parentId }
        )
        await this.fetchFolderStructure()
        return response.data.data
      } catch (error) {
        this.error = 'Failed to create folder'
        console.error('Error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async renameFolder(folderId: number, newName: string) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.patch<ApiResponse<FolderType>>(
            `${API_BASE_URL}/folders/${folderId}`,
            { name: newName }
        )
        await this.fetchFolderStructure()
        return response.data.data
      } catch (error) {
        this.error = 'Failed to rename folder'
        console.error('Error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteFolder(folderId: number) {
      this.loading = true
      this.error = null
      try {
        await axios.delete(`${API_BASE_URL}/folders/${folderId}`)
        await this.fetchFolderStructure()
        if (this.selectedFolder?.id === folderId) {
          this.selectedFolder = null
        }
      } catch (error) {
        this.error = 'Failed to delete folder'
        console.error('Error:', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  },
})
