import { useState } from 'react'
import { useRef } from 'react'
import { styleState } from './ComparisonAccordion'

export const AccordionItem = ({
  label,
  state,
  children
}: {
  state: string
  label: string
  children: React.ReactNode
}) => {
  const [clicked, setClicked] = useState(false)
  const contentEl = useRef()

  const handleToggle = () => {
    setClicked((prev) => !prev)
  }
  return (
    <li className={`accordion_item ${clicked ? 'active' : ''}`}>
      <button
        className="flex flex-wrap text-left w-full px-5 py-2 font-[700px] cursor-pointer border-none justify-between"
        onClick={handleToggle}
        style={{ color: styleState(state), backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
      >
        {label}
        <span className="text-xl">{clicked ? '—' : '+'} </span>
      </button>

      <div
        ref={contentEl}
        className="answer_wrapper"
        style={clicked ? { height: contentEl.current.scrollHeight } : { height: '0px' }}
      >
        {children}
      </div>
    </li>
  )
}
