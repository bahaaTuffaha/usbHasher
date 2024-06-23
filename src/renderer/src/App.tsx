import { HashRouter, Route, Routes } from 'react-router-dom'
import { MainPage } from './pages/MainPage'
import { HashingProcess } from './pages/HashingProcess'

function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/hashing" element={<HashingProcess />} />
      </Routes>
    </HashRouter>
  )
}

export default App
