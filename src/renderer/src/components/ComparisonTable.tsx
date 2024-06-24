import useScreenSize from '@renderer/hooks/useScreenSize'
import { compareDataType } from '@renderer/pages/HashingProcess'

export const HashComparisonTable = ({ data }: { data: compareDataType[] }) => {
  const { width, height } = useScreenSize()
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Hash Comparison Results</h1>
      <div
        style={{ height: height * 0.8, width: width * 0.8 }}
        className="overflow-y-scroll overflow-x-scroll"
      >
        <table className="table-auto w-full border-collapse border border-gray-300 text-black">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Path</th>
              <th className="border border-gray-300 px-4 py-2">Old SHA-256</th>
              <th className="border border-gray-300 px-4 py-2">New SHA-256</th>
              <th className="border border-gray-300 px-4 py-2">Last Modified</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="bg-white even:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">{item.path}</td>
                <td className="border border-gray-300 px-4 py-2">{item.oldSha}</td>
                <td className="border border-gray-300 px-4 py-2">{item.newSha}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(item.lastModified).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
