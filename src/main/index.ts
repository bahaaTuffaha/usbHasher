import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { processDirectory } from './hasher'
const { exec } = require('child_process')
const os = require('os')

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
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test //////////////////////////////////////////////////////////////////////
  // ipcMain.on('ping', () => console.log('pong'))

  function getUSBDevices(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (os.platform() !== 'win32') {
        exec('lsblk -o NAME,SIZE,VENDOR,MODEL,TYPE,MOUNTPOINT', (error, stdout) => {
          if (error) {
            reject(`exec error: ${error}`)
            return
          }
          // Split output into lines and filter out empty lines
          const lines = stdout
            .trim()
            ?.split('\n')
            ?.map((line) => line.trim())
            ?.filter((line) => line.length > 0)

          // Extract header line
          const header = lines
            .shift()
            ?.split(/\s{2,}/)
            ?.map((h) => h.trim().toLowerCase())

          // Parse each line into an object
          const devices = lines.map((line) => {
            const values = line.split(/\s{2,}/).map((value) => value.trim())
            const device = {}
            header.forEach((key, index) => {
              device[key] = values[index] || ''
            })
            return device
          })
          resolve(devices)
        })
      } else {
        exec(
          'wmic logicaldisk where drivetype=2 get deviceid, volumename, description',
          (error, stdout) => {
            if (error) {
              reject(`exec error: ${error}`)
              return
            }
            // Split output into lines and filter out empty lines
            const lines = stdout
              .trim()
              .split('\n')
              .map((line) => line.trim())
              .filter((line) => line.length > 0)

            // Extract header line
            const header = lines
              .shift()
              .split(/\s{2,}/)
              .map((h) => h.trim().toLowerCase())

            // Parse each line into an object
            const devices = lines.map((line) => {
              const values = line.split(/\s{2,}/).map((value) => value.trim())
              const device = {}
              header.forEach((key, index) => {
                device[key] = values[index] || ''
              })
              return device
            })
            resolve(devices)
          }
        )
      }
    })
  }

  // Register an IPC handler for getting USB devices
  ipcMain.handle('get-usb-devices', async () => {
    try {
      const devices = await getUSBDevices()
      return devices
    } catch (error) {
      console.error(error)
      return []
    }
  })

  ipcMain.handle('process-directory', async (event, directoryPath, outputCSVPath) => {
    try {
      await processDirectory(directoryPath, outputCSVPath)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
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
