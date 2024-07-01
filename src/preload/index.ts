import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('detectUsb', {
      getUSBDevices: () => ipcRenderer.invoke('get-usb-devices')
    })
    contextBridge.exposeInMainWorld('hasherPart', {
      processDirectory: (directoryPath, outputCSVPath) =>
        ipcRenderer.invoke('process-directory', directoryPath, outputCSVPath)
    })
    contextBridge.exposeInMainWorld('storageApi', {
      getSharedData: async (key) => await ipcRenderer.invoke('get-shared-data', key),
      setSharedData: async (key, value) => await ipcRenderer.invoke('set-shared-data', key, value)
    })
    contextBridge.exposeInMainWorld('gateApi', {
      openGate: async () => await ipcRenderer.invoke('openGate'),
      closeGate: async () => await ipcRenderer.invoke('closeGate'),
      setUpdateFileFalse: async () => await ipcRenderer.invoke('setUpdateFileFalse')
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
