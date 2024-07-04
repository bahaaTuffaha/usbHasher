import useScreenSize from '@renderer/hooks/useScreenSize'
import { compareDataType } from '@renderer/pages/HashingProcess'
import { AccordionItem } from './AccordionItem'

export function styleState(state: string) {
  switch (state) {
    case 'Modified':
      return 'blue'

    case 'Removed':
      return 'red'

    case 'Added':
      return 'green'

    default:
      return 'black'
      break
  }
}

export const ComparisonAccordion = ({ data }: { data: compareDataType[] }) => {
  const { width, height } = useScreenSize()

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Hash Comparison Results</h1>
      <div
        style={{ maxHeight: height * 0.8, maxWidth: width * 0.8 }}
        className="overflow-y-scroll overflow-x-scroll scroll"
      >
        <ul className="accordion select-text">
          {data.map((item, index) => (
            <AccordionItem key={index} label={item.path} state={item.state}>
              <div className="bg-white p-5">
                <div className="flex flex-col space-y-5 text-black">
                  <span>
                    {' '}
                    <span className="font-bold">Old SHA-256:</span> {item.oldSha ?? 'NaN'}
                  </span>
                  <span>
                    <span className="font-bold">New SHA-256:</span> {item.newSha ?? 'NaN'}
                  </span>
                  <span>
                    <span className="font-bold">State:</span>{' '}
                    <span
                      style={{
                        textDecoration: styleState(item.state) == 'red' ? 'line-through' : '',
                        color: styleState(item.state)
                      }}
                    >
                      {item.state}
                    </span>
                  </span>
                  <span>
                    <span className="font-bold">Last Modified:</span>{' '}
                    {item.lastModified ? new Date(item.lastModified).toLocaleString() : 'NaN'}
                  </span>
                  <span>
                    <span className="font-bold">Created:</span>{' '}
                    {item.creationDate ? new Date(item.creationDate).toLocaleString() : 'NaN'}
                  </span>
                </div>
              </div>
            </AccordionItem>
          ))}
        </ul>
      </div>
    </div>
  )
}
