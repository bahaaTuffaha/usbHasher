export const MainButton = ({
  text = 'button',
  disabled = false,
  onClick
}: {
  text?: string
  disabled?: boolean
  onClick?: () => void
}): JSX.Element => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-blue-500 text-white font-bold py-1 px-4 rounded-full shadow-lg transform transition-transform duration-200 active:scale-90 capitalize ${disabled ? 'bg-gray-500' : ''}`}
    >
      {text}
    </button>
  )
}
