import { DevicesList } from '@renderer/components/DevicesList'
import { MainButton } from '@renderer/components/MainButton'
import Versions from '@renderer/components/Versions'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export const MainPage = () => {
  const [usbPath, setUsbPath] = useState('')
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
      <DevicesList setUsbPath={setUsbPath} />
      <div className="actions">
        <Link to="/hashing" state={{ path: usbPath }}>
          <MainButton text="Next" />
        </Link>
      </div>
      <Versions></Versions>
    </>
  )
}
