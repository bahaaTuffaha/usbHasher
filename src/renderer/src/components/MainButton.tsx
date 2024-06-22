export const MainButton = ({ text = 'button' }: { text?: string }): JSX.Element => {
  return (
    <button className="bg-blue-500 text-white font-bold py-1 px-4 rounded-full shadow-lg transform transition-transform duration-200 active:scale-90 capitalize">
      {text}
    </button>
  )
}
