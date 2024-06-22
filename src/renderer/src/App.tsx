import { DevicesList } from './components/DevicesList'
import { MainButton } from './components/MainButton'
import Versions from './components/Versions'

function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Hash all the files in <span className="react">Usb Drive</span>
        &nbsp;and <span className="ts">Check for any changes.</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <DevicesList />
      <div className="actions">
        <MainButton text="Next" />
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
