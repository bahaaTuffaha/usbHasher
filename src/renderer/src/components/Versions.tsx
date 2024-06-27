import { useState } from 'react'
import githubLogo from './../assets/github-mark-white.svg'
function Versions(): JSX.Element {
  const [versions] = useState(window.electron.process.versions)

  return (
    <ul className="versions">
      <li>
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/bahaaTuffaha">
          <img className="inline" src={githubLogo} height={20} width={20} /> Bahaa Tuffaha
        </a>
      </li>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://paypal.me/BahaaTuffaha?country.x=SA&locale.x=en_US"
      >
        <li>Donation 💖</li>
      </a>
    </ul>
  )
}

export default Versions
