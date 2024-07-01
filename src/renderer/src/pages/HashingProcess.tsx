import { HashComparisonTable } from '@renderer/components/ComparisonTable'
import { MainButton } from '@renderer/components/MainButton'
import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export type compareDataType = {
  path: string
  oldSha: string
  newSha: string
  state: string
  lastModified: Date
  creationDate: Date
}

export const HashingProcess = () => {
  const location = useLocation()
  const { path } = location.state
  const [isLoading, setIsLoading] = useState(false)
  const [compareData, setCompareData] = useState<compareDataType[]>([])
  const [Percentage, setPercentage] = useState(0)
  const [currentMessage, setCurrentMessage] = useState('')
  const [rescan, setRescan] = useState(false)
  const message1 = 'Scan completed. Nothing Changed'
  const message2 = 'Scan completed. CSV File Created'
  const memoizedHashing = useCallback(async () => {
    await window.gateApi.openGate()
    await window.storageApi.setSharedData('percentage', 0)
    await window.storageApi.setSharedData('index', 0)
    setCompareData([])
    try {
      setIsLoading(true)
      // window.storageApi.setSharedData('percentage', 0)
      const result = await window.hasherPart.processDirectory(path, `${path}/usbHasher.csv`)
      if (Array.isArray(result)) {
        setCompareData(result)
        setIsLoading(false)
        setCurrentMessage(message1)
      } else if (result?.success === true) {
        setCurrentMessage(message2)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Failed to hash files:', error)
      setIsLoading(false)
    }
  }, [path, rescan])

  useEffect(() => {
    memoizedHashing()
  }, [memoizedHashing])

  useEffect(() => {
    const fetchData = async () => {
      const value = await window.storageApi.getSharedData('percentage')
      setPercentage(value)
    }

    fetchData() // Fetch data initially

    const interval = setInterval(() => {
      if (isLoading) {
        fetchData() // Fetch data every 2 seconds
        console.log('dfsdf')
      }
    }, 2000)

    // Cleanup function to clear the interval when the component unmounts or when the effect is re-run
    return () => clearInterval(interval)
  }, [isLoading])

  return (
    <div>
      {isLoading && <h1>Hashing {path} ...</h1>}
      {isLoading && <h2>Please Wait this will take time specially big files bigger than 2 GB</h2>}
      {compareData.length == 0 && !isLoading && <h1>{currentMessage}</h1>}
      {isLoading && (
        <div className="border-gray-300 h-20 w-20 animate-spin rounded-full border-8 border-t-red-600" />
      )}
      {compareData.length > 0 && <h1>Csv found</h1>}
      {compareData.length > 0 && <HashComparisonTable data={compareData} />}
      {isLoading && <h1>{Percentage + '%'}</h1>}
      {/* {!isLoading &&<MainButton text='Update'/>} */}
      {!isLoading && (
        <MainButton
          onClick={async () => {
            setRescan((prev) => !prev)
          }}
          text="Rescan"
        />
      )}
      {!isLoading && (
        <MainButton
          onClick={async () => {
            await window.gateApi.setUpdateFileFalse()
            setRescan((prev) => !prev)
          }}
          text="Re-hash/Update"
        />
      )}
    </div>
  )
}
