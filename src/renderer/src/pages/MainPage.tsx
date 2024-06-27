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
        Hash all the files in <span className="text-[#6C0036] font-[700]">Usb Drive</span>
        &nbsp;and <span className="ts">Check for any changes.</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <DevicesList setUsbPath={setUsbPath} />
      <div className="actions">
        <Link
          className={`${usbPath.length <= 0 ? 'pointer-events-none' : ''}`}
          to="/hashing"
          state={{ path: usbPath }}
        >
          <MainButton disabled={usbPath.length <= 0} text="Next" />
        </Link>
      </div>
      <Versions />
    </>
  )
}
