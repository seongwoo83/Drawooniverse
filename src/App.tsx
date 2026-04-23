import { useEffect, useState } from 'react'
import './App.css'
import DrawingApp from './components/drawingApp/DrawingApp'
import LandingPage from './components/landing/LandingPage'

const APP_HASH = '#/app'

const getIsAppRoute = () => window.location.hash === APP_HASH

function App() {
  const [isAppRoute, setIsAppRoute] = useState(getIsAppRoute)

  useEffect(() => {
    const syncRoute = () => setIsAppRoute(getIsAppRoute())

    window.addEventListener('hashchange', syncRoute)
    return () => {
      window.removeEventListener('hashchange', syncRoute)
    }
  }, [])

  if (isAppRoute) {
    return (
      <div className="app_page_shell">
        <header className="app_page_header">
          <a className="app_page_back" href="#/">
            Back to landing
          </a>
          <div className="app_page_intro">
            <p className="demo_eyebrow">Browser App</p>
            <h1>Drawooniverse workspace</h1>
          </div>
          <a className="app_page_repo" href="https://github.com/seongwoo83/Drawooniverse" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </header>
        <main className="app_page_main">
          <div className="demo_frame app_page_frame">
            <DrawingApp />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="site_shell">
      <LandingPage />
      <footer className="site_footer">
        <p>Drawooniverse on GitHub Pages</p>
        <a href="https://github.com/seongwoo83/Drawooniverse" target="_blank" rel="noreferrer">
          github.com/seongwoo83/Drawooniverse
        </a>
      </footer>
    </div>
  )
}

export default App
