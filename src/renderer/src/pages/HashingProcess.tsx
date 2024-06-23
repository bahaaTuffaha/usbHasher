import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export const HashingProcess = () => {
  const location = useLocation()
  const { path } = location.state
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const hashing = async () => {
      try {
        setIsLoading(true)
        const result = await window.hasherPart.processDirectory(path, `${path}\\output.csv`)
        if (result?.success == true) {
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Failed to hash files:', error)
        setIsLoading(false)
      }
    }

    hashing()
  }, [])

  return (
    <div>
      <h1>Hashing {path} ...</h1>
      {isLoading && (
        <div className="border-gray-300 h-20 w-20 animate-spin rounded-full border-8 border-t-blue-600" />
      )}
    </div>
  )
}
