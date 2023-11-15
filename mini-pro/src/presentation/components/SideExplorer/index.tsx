import { ReactComponent as ChevronRightIcon } from '../../icons/chevron-right.svg'
import style from './index.module.scss'
import { useAppDispatch, useAppSelector } from '../../../infrastructure/state/app/hooks'
import { selectFolderExpansionState, toggleExpansion } from '../../../infrastructure/state/sideExplorerSlice'
import { Directory } from '../../../domain/entities/Directory'
// import { fileStorageInteractor } from '../../../adapters/FileStorageAdapter'
import { SetStateAction, useEffect, useState} from 'react'
// import { NavLinkPersist } from '../../supports/Persistence'
// import { useParams } from 'react-router-dom'
import { useFileAdapter, useFolderAdapter } from '../../../adapters/DirectoryAdapter'
import { FolderStatus } from '../../../domain/repositories/DirectoryState'
import { CopyOutlined, DeleteOutlined, EditOutlined,FileAddOutlined, FolderAddOutlined,SnippetsOutlined} from '@ant-design/icons'
import { selectFileContent } from '../../../infrastructure/state/DirectoryState'
import { useSelector } from 'react-redux'



interface FolderProps {
  folder: Directory.FolderMetadata
  openFile: (file: Directory.FileMetadata) => void
  copiedItem: Directory.FileMetadata | null
  setCopiedItem: React.Dispatch<React.SetStateAction<Directory.FileMetadata | null>>

}

interface FileProps {
  file: Directory.FileMetadata
  openFile: (file: Directory.FileMetadata) => void
  setCopiedItem: React.Dispatch<React.SetStateAction<Directory.FileMetadata | null>>
}

interface ExplorerItemsProps {
  folder: Directory.FolderMetadata
  openFile: (file: Directory.FileMetadata) => void
  copiedItem: Directory.FileMetadata | null
  setCopiedItem: React.Dispatch<React.SetStateAction<Directory.FileMetadata | null>>

}

interface SideExplorerProps {
  workspace: Directory.FolderMetadata
  openFile: (file: Directory.FileMetadata) => void

}



export function SideExplorer({ workspace, openFile }: SideExplorerProps) {

 

  const { createFile, createFolder } = useFolderAdapter(workspace)
  const [copiedItem, setCopiedItem] = useState<Directory.FileMetadata | null>(null)
  

  const createNewFile = async (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    event.stopPropagation()
    event.preventDefault()
    const fileName = prompt('Enter File Name')
    if (fileName === null) return
    createFile({ name: fileName })
  }

  const createNewFolder = async (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    event.stopPropagation()
    event.preventDefault()
    const folderName = prompt('Enter Folder Name')
    if (folderName === null) return
    createFolder({ name: folderName })
  }
  return <>
    <div className={style.workspaceName}>
      <div className={style.left}>
        <span>{workspace.name}</span>
      </div>
      <div className={style.right}>
       
        <button onClick={createNewFolder}>NewFolder </button>
        <button onClick={createNewFile}>NewFile </button>
      </div>
    </div>

    <FolderItems folder={workspace} openFile={openFile} copiedItem={copiedItem} 
      setCopiedItem={setCopiedItem}/>
  </>
}

export function FolderItems({ folder, openFile,copiedItem, setCopiedItem }: ExplorerItemsProps) {

  const { fetchFolderContent, folderContent, folderStatus } = useFolderAdapter(folder)

  useEffect(fetchFolderContent, [])

  if (folderStatus === FolderStatus.ContentLoading) {
    return (
      <div>Loading...</div>
    )
  }

  return <>
    {/* {folderContent.length === 0 &&
      <Empty className={style.empty} description="Folder Empty" />
    } */}
    {folderContent.map(item => {
      if (item.type === Directory.NodeType.file) {
        return (
          <File 
            key={item.id} 
            file={item} 
            openFile={openFile} 
            setCopiedItem={setCopiedItem} 
          />
        )
      } else {
        return (
          <Folder 
            key={item.id} 
            folder={item} 
            openFile={openFile} 
            copiedItem={copiedItem}
            setCopiedItem={setCopiedItem}
          />
        )
      }
    })}
  </>
}



export function File({ file, openFile, setCopiedItem }: FileProps) {

  const { deleteFile, renameFile, fetchFileContent} = useFileAdapter(file)
  const fileContent = useSelector(selectFileContent(file))
  useEffect(() => {
    fetchFileContent()
  }, [file.id, fetchFileContent])

  const handleCopy = () => {
    setCopiedItem({...file, content:fileContent?.content})
    // setCopiedItem(file)
    
  }

  const handleCut = () => {
    setCopiedItem(file)
  }
  
  const renameThisFile = async (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    event.preventDefault()
    const newName = prompt(`Enter New Name for file: ${file.name}`, file.name)
    if(newName) renameFile(newName)
    return true
  }

  const deleteThisFile = async (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    event.stopPropagation()
    event.preventDefault()
    const isConfirmedDelete = window.confirm(`Permanently Delete File: ${file.name}`)
    if (isConfirmedDelete === false) return
    deleteFile()
  }

  
  return (
    <div className={style.file}>
      <div
        className={`${style.name} ${style.entry}`}
        onClick={() => openFile(file)}
      >
        <div className={style.left}>
          {/* <span className={style.icon}><FileIcon /></span> */}
          <span>{file.name}</span>
        </div>
        <div className={style.right}>
          <DeleteOutlined className={style.iconButton} title={`Delete File: ${file.name}`} onClick={deleteThisFile} />
          <EditOutlined className={style.iconButton} title={`Rename File: ${file.name}`} onClick={renameThisFile} />
          <CopyOutlined className={style.iconButton} title={`Copy File: ${file.name}`} onClick={handleCopy} />
  
        </div>
      </div>
    </div>
  )
}

export function Folder({ folder, openFile,copiedItem, setCopiedItem  }: FolderProps) {

  // const [isExpanded, toggleExpansion] = useState(false)
  const isExpanded = useAppSelector(selectFolderExpansionState(folder))
  const dispatch = useAppDispatch()
  
  const { createFolder, createFile, deleteFolder, renameFolder} = useFolderAdapter(folder)

  const deleteThisFolder = async (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    event.stopPropagation()
    event.preventDefault()
    const isConfirmedDelete = window.confirm(`Permanently Delete Folder: ${folder.name}`)
    if (isConfirmedDelete === false) return
    deleteFolder()
  }
  
  const renameThisFolder = async (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    // commenting this line will hide context menu after button click
    // event.stopPropagation()
    event.preventDefault()
    const newName = prompt(`Enter New Name for file: ${folder.name}`, folder.name)
    if(newName) renameFolder(newName)
    return true
  }

  const createNewFile = async (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    event.stopPropagation()
    event.preventDefault()

    const fileName = prompt('Enter File Name')
    if (fileName === null) return

    // Extract the file extension
    const fileExtension = fileName.split('.').pop()

    
    switch (fileExtension) {
    case 'txt':
      // initialContent = 'New text file content'
      break
    case 'js':
      // initialContent = '// JavaScript file content\n'
      break
    case 'ts':
      // initialContent = '// TypeScript file content\n'
      break
    case 'json':
      // initialContent = '{\n  \n}'
      break
    // Add more cases for other file types 
    }

    // Create the new file with the initial content
    createFile({ name: fileName})
  }

  const handlePaste = async (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    event.stopPropagation()
    event.preventDefault()
    console.log('copiedItem',copiedItem)
    if (!copiedItem) {
      alert('No item to paste')
      return
    }
    
    const { name, content } = copiedItem
    console.log('content',content)
    createFile({ name, content })
    // createFile(copiedItem)
    setCopiedItem(null)// clear the copied item
  }


  const createNewFolder = async (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    event.stopPropagation()
    event.preventDefault()
    const folderName = prompt('Enter Folder Name')
    if (folderName === null) return
    createFolder({ name: folderName })
  }

  const handleFolderClick = () => {
    dispatch(toggleExpansion(folder))
  }

  return (
    <div className={style.folder}>
      <div className={`${style.name} ${style.entry}`} onClick={handleFolderClick}>
        <div className={style.left}>
          <span className={isExpanded ? `${style.icon} ${style.turn90}` : `${style.icon}`}><ChevronRightIcon /></span>
          <span>{folder.name}</span>
        </div>
        <div className={style.right}>
          <DeleteOutlined className={style.iconButton} title={`Delete Folder: ${folder.name}`} onClick={deleteThisFolder} />
          <FolderAddOutlined className={style.iconButton} title={`Create new folder in ${folder.name}`} onClick={createNewFolder} />
          <FileAddOutlined className={style.iconButton} title={`Create new file in ${folder.name}`} onClick={createNewFile} />
          <EditOutlined className={style.iconButton} title={`Rename Folder: ${folder.name}`} onClick={renameThisFolder} />
          <SnippetsOutlined className={style.iconButton} title={`Paste Folder: ${folder.name}`} onClick={handlePaste} />
        </div>
      </div>
      <div className={style.child}>
        {isExpanded ? <FolderItems folder={folder} openFile={openFile} copiedItem={copiedItem} setCopiedItem={setCopiedItem} /> : null}
 
      </div>
    </div>
  )
}


