export namespace Directory {

  export type NodeId = string

  export enum NodeType {
    folder = 'folder',
    file = 'file',
  }

  export interface Node {
    id: NodeId
    name: string
    /** Parent ID is Null when Node is the root */
    parentId: NodeId
    type: NodeType
    editedAt: EpochTimeStamp
    createdAt: EpochTimeStamp
  }

  export interface FileMetadata extends Node {
    type: NodeType.file
    content?: string
  }

  export interface FolderMetadata extends Node {
    type: NodeType.folder
  }

  export interface FileContent {
    id: FileMetadata['id']
    content: string
  }

  export type FileType = FileMetadata & FileContent
  export type FolderContent = (Directory.FileMetadata | Directory.FolderMetadata)[]

  export const RootNode: FolderMetadata = {
    type: NodeType.folder,
    id: 'home',
    name: 'Root Folder',
    parentId: 'root',
    editedAt: 0,
    createdAt: 0
  }

}