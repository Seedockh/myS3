import fs from 'fs'
import path from 'path'

interface ProcessFile {
  file: string | null
  message: string | null
}

export default class FileManager {
  defaultPath: string
  platform: string

  constructor(platform: string) {
    this.platform = platform
  }

  init(dirName: string): string {
    // Get environment folder for any OS
    let dataDir: string

    if (this.platform === 'darwin') {
      dataDir = `${process.env.HOME}/Library/Preferences/${dirName}`
    } else {
      dataDir = `${process.env.HOME}/${dirName}`
    }

    // Create data folder if not exists
    if (!fs.existsSync(`${process.env.HOME}/myS3DATA`))
      fs.mkdirSync(`${process.env.HOME}/myS3DATA`)

    if (!fs.existsSync(dataDir) && this.platform === process.platform)
      fs.mkdirSync(dataDir)

    this.defaultPath = dataDir
    return dataDir
  }

  readFolder(path: string): Array<string> | string {
    if (!fs.existsSync(`${this.defaultPath}/${path}`))
      return `Folder ${this.defaultPath}/${path} does not exist.`

    const files = fs.readdirSync(`${this.defaultPath}/${path}`)
    return files
  }

  createFolder(path: string): string {
    if (process.env.NODE_ENV === 'test' && !this.defaultPath.includes('/tests'))
      this.defaultPath += '/tests'
    if (fs.existsSync(`${this.defaultPath}/${path}`)) {
      return `Folder ${this.defaultPath}/${path} already exists.`
    } else {
      fs.mkdirSync(`${this.defaultPath}/${path}`)
      return `Folder ${this.defaultPath}/${path} successfully created.`
    }
  }

  renameFolder(path: string, name: string): string {
    if (!fs.existsSync(`${this.defaultPath}/${path}`)) {
      return `Folder ${this.defaultPath}/${path} does not exist.`
    } else {
      fs.renameSync(
        `${this.defaultPath}/${path}`,
        `${this.defaultPath}/${name}`,
      )
      return `Folder ${this.defaultPath}/${name} successfully updated.`
    }
  }

  deleteFolder(path: string): string {
    if (!fs.existsSync(`${this.defaultPath}/${path}`)) {
      return `Folder ${this.defaultPath}/${path} does not exist.`
    } else {
      fs.rmdirSync(`${this.defaultPath}/${path}`, { recursive: true })
      return `Folder ${this.defaultPath}/${path} deleted successfully.`
    }
  }

  downloadFile(filePath: string): ProcessFile {
    if (fs.existsSync(`${this.defaultPath}/${filePath}`)) {
      return {
        file: path.resolve(`${this.defaultPath}/${filePath}`),
        message: null,
      }
    } else {
      return {
        file: null,
        message: 'This file does not exist.',
      }
    }
  }

  downloadPublicFile(filePath: string): ProcessFile {
    if (fs.existsSync(`${this.defaultPath}/public/${filePath}`)) {
      return {
        file: path.resolve(`${this.defaultPath}/public/${filePath}`),
        message: null,
      }
    } else {
      return {
        file: null,
        message: 'This file does not exist.',
      }
    }
  }

  shareFile(filePath: string): ProcessFile {
    if (fs.existsSync(`${this.defaultPath}/${filePath}`)) {
      if (!fs.existsSync(`${this.defaultPath}/public`))
        this.createFolder('public')

      const pathParts = filePath.split('/')
      const blobFullName = pathParts[2]
      fs.copyFileSync(
        `${this.defaultPath}/${filePath}`,
        `${this.defaultPath}/public/${blobFullName}`,
      )
      return {
        file: `${blobFullName}`,
        message: null,
      }
    } else {
      return {
        file: null,
        message: 'This file does not exist.',
      }
    }
  }

  duplicateFile(filePath: string): string {
    if (!fs.existsSync(`${this.defaultPath}/${filePath}`))
      return `File ${this.defaultPath}/${filePath} does not exist.`

    const pathParts = filePath.split('/')
    const blobFullName = pathParts[2]
    const blobName = path.parse(blobFullName).name
    const blobExt = path.parse(blobFullName).ext
    let nbCopies = 1

    while (
      fs.existsSync(
        `${this.defaultPath}/${pathParts[0]}/${pathParts[1]}/${blobName}.copy.${nbCopies}${blobExt}`,
      )
    ) {
      nbCopies++
    }

    fs.copyFileSync(
      `${this.defaultPath}/${filePath}`,
      `${this.defaultPath}/${pathParts[0]}/${pathParts[1]}/${blobName}.copy.${nbCopies}${blobExt}`,
    )

    return `${blobName}.copy.${nbCopies}${blobExt}`
  }

  deleteFile(path: string): string {
    if (!fs.existsSync(`${this.defaultPath}/${path}`)) {
      return `File ${this.defaultPath}/${path} does not exist.`
    } else {
      fs.unlinkSync(`${this.defaultPath}/${path}`)
      return `File ${this.defaultPath}/${path} deleted successfully.`
    }
  }
}
