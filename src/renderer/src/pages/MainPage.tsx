import { DevicesList } from '@renderer/components/DevicesList'
import { MainButton } from '@renderer/components/MainButton'
import Versions from '@renderer/components/Versions'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import RED_USB from '../assets/RED_USB.png'

export const MainPage = () => {
  const [usbPath, setUsbPath] = useState('')
  return (
    <>
      <img className="absolute -z-10 top-0 left-5 w-[60%] h-auto rotate-3" src={RED_USB} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text2">
        Hash all the files in <span className="text-white font-[700]">Usb Drive</span>
        &nbsp;and <span className="ts">Check for any changes.</span>
      </div>

      <p className="tip my-2">
        This will create CSV file containing sha256 hashes of all the files in selected usb.
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
