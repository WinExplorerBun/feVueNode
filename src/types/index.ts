// src/types/index.ts
export interface FolderType {
  id: number
  name: string
  parentId: number | null
  type: 'folder' | 'file'
  path: string
  createdAt: string | Date;
  updatedAt: string | Date;
  children?: FolderType[]
}

export interface ApiResponse<T> {
  data: T
  status: number
  message: string
}
