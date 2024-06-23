import { USBDeviceType } from '@renderer/utils/types'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
export const DevicesList = ({
  setUsbPath
}: {
  setUsbPath: Dispatch<SetStateAction<string>>
}): JSX.Element => {
  const [usbDevices, setUsbDevices] = useState<USBDeviceType[]>([])

  useEffect(() => {
    const fetchUsbDevices = async () => {
      try {
        const devices = (await window.detectUsb.getUSBDevices()) as USBDeviceType[]
        setUsbDevices(devices)
      } catch (error) {
        console.error('Failed to fetch USB devices:', error)
      }
    }

    fetchUsbDevices()
  }, [])

  const handleSelectChange = (event) => {
    setUsbPath(event.target.value)
  }

  return (
    <div className="flex items-center justify-center bg-gray-100">
      <select
        onChange={handleSelectChange}
        className="bg-white border border-gray-300 rounded-lg p-2 shadow-md text-black"
      >
        <option value="">Select a USB device</option>
        {usbDevices.map((device: USBDeviceType, index: number) => (
          <option key={index} value={device.deviceid}>
            {device.deviceid} - {device.volumename}
          </option>
        ))}
      </select>
    </div>
  )
}
