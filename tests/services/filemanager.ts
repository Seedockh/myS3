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
/***********  FOLDERS TESTS  **********/
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

  it('LISTS all files from a folder successfully', async done => {
    fs.writeFileSync(`${process.env.HOME}/myS3DATA/tests/testingfolder/test1.txt`)
    fs.writeFileSync(`${process.env.HOME}/myS3DATA/tests/testingfolder/test2.txt`)
    fs.writeFileSync(`${process.env.HOME}/myS3DATA/tests/testingfolder/test3.txt`)

    const folder = envFolder.readFolder('testingfolder')
    expect(JSON.stringify(folder))
      .equals(JSON.stringify(['test1.txt', 'test2.txt', 'test3.txt']))
    done()
  })

  it('FAILS to list files from unknown folder', async done => {
    const folder = envFolder.readFolder('testingfolders')
    expect(folder).equals(`Folder ${process.env.HOME}/myS3DATA/tests/testingfolders does not exist.`)
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

/*******  FILES TESTS  *********/
  it('DOWNLOADS a file successfully', async done => {
    expect(envFolder.defaultPath).equals(`${process.env.HOME}/myS3DATA/tests`)
    envFolder.createFolder('testuser')
    envFolder.createFolder('testuser/testbucket')

    if (!fs.existsSync(`${envFolder.defaultPath}/testuser/testbucket/test-file.txt`)) {
      fs.writeFileSync(`${envFolder.defaultPath}/testuser/testbucket/test-file.txt`, 'This is a test file')
    }
    const file = envFolder.downloadFile('testuser/testbucket/test-file.txt')
    expect(JSON.stringify(file)).equals(JSON.stringify({
      file: `${process.env.HOME}/myS3DATA/tests/testuser/testbucket/test-file.txt`,
      message: null
    }))
    done()
  })

  it('FAILS to download unexistent file', async done => {
    const file = envFolder.downloadFile('testuser/testbucket/unexistent-file.txt')
    expect(JSON.stringify(file)).equals(JSON.stringify({
      file: null,
      message: 'This file does not exist.'
    }))
    done()
  })



  it('SHARES a file successfully', async done => {
    expect(envFolder.defaultPath).equals(`${process.env.HOME}/myS3DATA/tests`)
    fs.rmdirSync(`${envFolder.defaultPath}/public`, { recursive: true })
    expect(fs.existsSync(`${envFolder.defaultPath}/public`)).equals(false)

    if (!fs.existsSync(`${envFolder.defaultPath}/testuser/testbucket/test-file.txt`)) {
      fs.writeFileSync(`${envFolder.defaultPath}/testuser/testbucket/test-file.txt`, 'This is a test file')
    }
    const file = envFolder.shareFile('testuser/testbucket/test-file.txt')
    expect(JSON.stringify(file)).equals(JSON.stringify({
      file: `test-file.txt`,
      message: null
    }))
    expect(fs.existsSync(`${envFolder.defaultPath}/public`)).equals(true)
    envFolder.deleteFile('public/test-file.txt')
    const secondFile = envFolder.shareFile('testuser/testbucket/test-file.txt')
    expect(JSON.stringify(secondFile)).equals(JSON.stringify({
      file: `test-file.txt`,
      message: null
    }))
    done()
  })

  it('FAILS to share unexistent file', async done => {
    const file = envFolder.shareFile('testuser/testbucket/unexistent-file.txt')
    expect(JSON.stringify(file)).equals(JSON.stringify({
      file: null,
      message: 'This file does not exist.'
    }))
    done()
  })

  it('DOWNLOADS a public file successfully', async done => {
    const file = envFolder.downloadPublicFile('test-file.txt')
    expect(JSON.stringify(file)).equals(JSON.stringify({
      file: `${process.env.HOME}/myS3DATA/tests/public/test-file.txt`,
      message: null
    }))
    done()
  })

  it('FAILS to download unexistent file', async done => {
    const file = envFolder.downloadPublicFile('unexistent-file.txt')
    expect(JSON.stringify(file)).equals(JSON.stringify({
      file: null,
      message: 'This file does not exist.'
    }))
    done()
  })

  it('DUPLICATES a file successfully', async done => {
    expect(fs.existsSync(`${envFolder.defaultPath}/testuser/testbucket/test-file.txt`)).equals(true)
    const firstCopy = envFolder.duplicateFile('testuser/testbucket/test-file.txt')
    expect(firstCopy).equals(`test-file.copy.1.txt`)
    expect(fs.existsSync(`${envFolder.defaultPath}/testuser/testbucket/test-file.copy.1.txt`)).equals(true)
    const secondCopy = envFolder.duplicateFile(`testuser/testbucket/test-file.txt`)
    expect(secondCopy).equals(`test-file.copy.2.txt`)
    expect(fs.existsSync(`${envFolder.defaultPath}/testuser/testbucket/test-file.copy.2.txt`)).equals(true)
    done()
  })

  it('FAILS to duplicate a file that does not exist', async done => {
    const wrongCopy = envFolder.duplicateFile(`testuser/testbucket/wrong-file.txt`)
    expect(wrongCopy).equals(`File ${envFolder.defaultPath}/testuser/testbucket/wrong-file.txt does not exist.`)
    expect(fs.existsSync(`${envFolder.defaultPath}/testuser/testbucket/wrong-file.copy.1.txt`)).equals(false)
    done()
  })

  it('DELETES a file successfully', async done => {
    const file = envFolder.deleteFile('testuser/testbucket/test-file.copy.2.txt')
    expect(file).equals(`File ${process.env.HOME}/myS3DATA/tests/testuser/testbucket/test-file.copy.2.txt deleted successfully.`)
    expect(fs.existsSync(`${envFolder.defaultPath}/testuser/testbucket/test-file.copy.2.txt`)).equals(false)
    done()
  })

  it('FAILS to delete a file that does not exist', async done => {
    const file = envFolder.deleteFile('testuser/testbucket/wrong-file.txt')
    expect(file).equals(`File ${process.env.HOME}/myS3DATA/tests/testuser/testbucket/wrong-file.txt does not exist.`)
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
