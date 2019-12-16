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
    if (!fs.existsSync(`${process.env.HOME}/myS3DATA`))
      fs.mkdirSync(`${process.env.HOME}/myS3DATA`)

    if (!fs.existsSync(dataDir) && this.platform === process.platform)
      fs.mkdirSync(dataDir)

    this.defaultPath = dataDir
    return dataDir
  }

  readFolder(path: string): Array<string>|string {
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
}
