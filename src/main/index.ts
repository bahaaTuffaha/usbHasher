import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { checkIfFileExists, processDirectory } from './hasher'
import { getUSBDevices } from './getUsbDevices'
import { compareHashCodes } from './compareAndCheck'
import fs from 'fs'
const os = require('os')

global.sharedData = { percentage: 0, index: 0, gate: false, updateFile: true }
function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.setMinimumSize(400, 300)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  // close all Listeners when I hit x
  mainWindow.on('close', (event) => {
    mainWindow.removeAllListeners()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  // app.on('browser-window-created', (_, window) => {
  //   optimizer.watchWindowShortcuts(window)
  // })

  // IPC test //////////////////////////////////////////////////////////////////////
  // ipcMain.on('ping', () => console.log('pong'))
  // Register an IPC handler for getting USB devices
  ipcMain.handle('get-usb-devices', () => {
    return getUSBDevices()
      .then((devices) => devices)
      .catch((error) => {
        console.error(error)
        return []
      })
  })
  ipcMain.handle('process-directory', (event, directoryPath, outputCSVPath) => {
    if (global.sharedData['gate']) {
      global.sharedData['gate'] = false
      return checkIfFileExists(
        os.platform() !== 'win32'
          ? `${directoryPath}/.usbHasher.csv`
          : `${directoryPath}/usbHasher.csv`
      )
        .then((exists) => {
          if (exists && global.sharedData['updateFile']) {
            return compareHashCodes(directoryPath)
          } else {
            if (global.sharedData['updateFile'] == false) {
              fs.unlink(`${directoryPath}/usbHasher.csv`, (err) => {
                if (err) {
                  console.error('File not deleted:' + err)
                } else {
                  console.log('File is deleted.')
                }
              })
            }
            global.sharedData['updateFile'] = true // set it back to true to give exists control over this cond.
            return processDirectory(directoryPath, outputCSVPath).then(() => ({ success: true }))
          }
        })
        .catch((error) => ({ success: false, error: error.message }))
    }
  })

  ipcMain.handle('get-shared-data', (event, key) => {
    return global.sharedData[key]
  })

  ipcMain.handle('set-shared-data', (event, key, value) => {
    global.sharedData[key] = value
  })
  ipcMain.handle('openGate', () => {
    global.sharedData['gate'] = true
  })
  ipcMain.handle('closeGate', () => {
    global.sharedData['gate'] = false
  })
  ipcMain.handle('setUpdateFileFalse', () => {
    global.sharedData['updateFile'] = false
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
