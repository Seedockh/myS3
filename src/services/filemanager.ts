import fs from 'fs'

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
    if (!fs.existsSync(dataDir) && this.platform === process.platform) {
      fs.mkdirSync(dataDir)
    }

    this.defaultPath = dataDir
    return dataDir
  }

  createFolder(path: string): string {
    if (fs.existsSync(`${this.defaultPath}/${path}`)) {
      console.log(`Folder ${this.defaultPath}/${path} already exists.`)
      return `Folder ${this.defaultPath}/${path} already exists.`
    } else {
      fs.mkdirSync(`${this.defaultPath}/${path}`)
      console.log(`Folder ${this.defaultPath}/${path} successfully created.`)
      return `Folder ${this.defaultPath}/${path} successfully created.`
    }
  }

  renameFolder(path: string, name: string): string {
    if (!fs.existsSync(`${this.defaultPath}/${path}`)) {
      console.log(`Folder ${this.defaultPath}/${path} does not exists.`)
      return `Folder ${this.defaultPath}/${path} does not exists.`
    } else {
      fs.renameSync(`${this.defaultPath}/${path}`, `${this.defaultPath}/${name}`)
      console.log(`Folder ${this.defaultPath}/${name} successfully updated.`)
      return `Folder ${this.defaultPath}/${name} successfully updated.`
    }
  }

  deleteFolder(path: string): string {
    if (!fs.existsSync(`${this.defaultPath}/${path}`)) {
      console.log(`Folder ${this.defaultPath}/${path} does not exists.`)
      return `Folder ${this.defaultPath}/${path} does not exists.`
    } else {
      fs.rmdirSync(`${this.defaultPath}/${path}`, { recursive: true });
      console.log(`Folder ${this.defaultPath}/${path} deleted successfully.`)
      return `Folder ${this.defaultPath}/${path} deleted successfully.`
    }
  }
}
