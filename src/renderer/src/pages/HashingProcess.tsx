import { HashComparisonTable } from '@renderer/components/ComparisonTable'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export type compareDataType = {
  path: string
  oldSha: string
  newSha: string
  lastModified: Date
}

export const HashingProcess = () => {
  const location = useLocation()
  const { path } = location.state
  const [isLoading, setIsLoading] = useState(false)
  const [compareData, setCompareData] = useState<compareDataType[]>([])
  const [Percentage, setPercentage] = useState(0)

  useEffect(() => {
    const hashing = async () => {
      try {
        setIsLoading(true)
        // window.storageApi.setSharedData('percentage', 0)
        const result = await window.hasherPart.processDirectory(path, `${path}\\output.csv`)
        if (Array.isArray(result)) {
          setCompareData(result)
          setIsLoading(false)
        } else if (result?.success == true) {
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Failed to hash files:', error)
        setIsLoading(false)
      }
    }

    hashing()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const value = await window.storageApi.getSharedData('percentage')
      setPercentage(value)
    }

    fetchData() // Fetch data initially

    const interval = setInterval(() => {
      fetchData() // Fetch data every 2 seconds
    }, 2000)

    // Cleanup function to clear the interval when the component unmounts or when the effect is re-run
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <h1>Hashing {path} ...</h1>
      <h2>Please Wait this will take time specially big files bigger than 2 GB!</h2>
      {isLoading && (
        <div className="border-gray-300 h-20 w-20 animate-spin rounded-full border-8 border-t-blue-600" />
      )}
      {compareData.length > 0 && <h1>Csv found</h1>}
      {compareData.length > 0 && <HashComparisonTable data={compareData} />}
      {isLoading && <h1>{Percentage + '%'}</h1>}
    </div>
  )
}
