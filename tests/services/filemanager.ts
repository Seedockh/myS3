import { expect } from 'chai'
import path from 'path'
import fs from 'fs'
import FileManager from '../../src/services/filemanager'

// MAKES SURE MYS3DATA WONT BE DELETED BY RENAMING IT
if (fs.existsSync(`${process.env.HOME}/myS3DATA`))
  fs.renameSync(`${process.env.HOME}/myS3DATA`, `${process.env.HOME}/myS3DATAtest`)

if (fs.existsSync(`${process.env.HOME}/Library/Preferences/myS3DATA`))
  fs.renameSync(
    `${process.env.HOME}/Library/Preferences/myS3DATA`,
    `${process.env.HOME}/Library/Preferences/myS3DATAtest`)

const envFolder = new FileManager(process.platform)
envFolder.init('myS3DATA/tests')

const filemanager = (): void => {
  it('CREATES a folder successfully', async done => {
    expect(envFolder.defaultPath).equals(`${process.env.HOME}/myS3DATA/tests`)

    const folder = envFolder.createFolder('testingfolder')
    expect(folder).equals(`Folder ${process.env.HOME}/myS3DATA/tests/testingfolder successfully created.`)
    expect(fs.existsSync(`${process.env.HOME}/myS3DATA/tests/testingfolder`)).equals(true)
    done()
  })

  it('FAILS to create a folder that already exists', async done => {
    const folder = envFolder.createFolder('testingfolder')
    expect(folder).equals(`Folder ${process.env.HOME}/myS3DATA/tests/testingfolder already exists.`)
    done()
  })

  it('UPDATES a folder successfully', async done => {
    const folder = envFolder.renameFolder('testingfolder', 'renamedFolder')
    expect(folder).equals(`Folder ${process.env.HOME}/myS3DATA/tests/renamedFolder successfully updated.`)
    expect(fs.existsSync(`${process.env.HOME}/myS3DATA/tests/renamedFolder`)).equals(true)
    done()
  })

  it('FAILS to update a folder that does not exist', async done => {
    const folder = envFolder.renameFolder('failfolder', 'renamedFolder')
    expect(folder).equals(`Folder ${process.env.HOME}/myS3DATA/tests/failfolder does not exist.`)
    done()
  })

  it('DELETES a folder successfully', async done => {
    const folder = envFolder.deleteFolder('renamedFolder')
    expect(folder).equals(`Folder ${process.env.HOME}/myS3DATA/tests/renamedFolder deleted successfully.`)
    expect(fs.existsSync(`${process.env.HOME}/myS3DATA/tests/renamedFolder`)).equals(false)
    done()
  })

  it('FAILS to delete a folder that does not exist', async done => {
    const folder = envFolder.deleteFolder('failfolder')
    expect(folder).equals(`Folder ${process.env.HOME}/myS3DATA/tests/failfolder does not exist.`)
    done()
  })


// MAKE SURE FALSE MYS3DATA IS DELETED AND MYS3DATATEST RENAMED TO MYS3DATA
if (fs.existsSync(`${process.env.HOME}/myS3DATA`))
  fs.rmdirSync(`${process.env.HOME}/myS3DATA`, { recursive: true })
if (fs.existsSync(`${process.env.HOME}/myS3DATAtest`))
  fs.renameSync(`${process.env.HOME}/myS3DATAtest`, `${process.env.HOME}/myS3DATA`)

if (fs.existsSync(`${process.env.HOME}/Library/Preferences/myS3DATA`))
  fs.rmdirSync(`${process.env.HOME}/Library/Preferences/myS3DATA`, { recursive: true })
if (fs.existsSync(`${process.env.HOME}/Library/Preferences/myS3DATAtest`))
  fs.renameSync(
    `${process.env.HOME}/Library/Preferences/myS3DATAtest`,
    `${process.env.HOME}/Library/Preferences/myS3DATA`)
}

export default filemanager
