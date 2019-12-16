import fs from 'fs'

export default class FileManager {
  defaultPath: string

  constructor(defaultPath: string) {
    this.defaultPath = defaultPath
  }

  createFolder(path: string): Array<string|Array<string>> {
    let cleanPath: string = ''
    let splitPath: Array<string> = ['']

    if (path.charAt(0) === '/')
      cleanPath = path.substring(1, path.length-1)

    if (path.charAt(path.length-1) === '/')
      cleanPath = path.substring(0, path.length-1)

    if (cleanPath.includes('/')) splitPath = path.split('/')

    return [cleanPath, splitPath]
  }
}
