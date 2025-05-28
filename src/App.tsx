import './App.css'
import Toolbar from './layout/toolbar/Toolbar'
import HistoryPanel from './layout/historyPanel/HistoryPanel'
import Canvas from './layout/canvas/Canvas'
import { DrawingProvider } from './providers/DrawingProvider'

function App() {

  return (
    <DrawingProvider>
      <div className="app_container">
        <header className='toolbar'>
          <Toolbar />
        </header>


        <section className='content_section'>
          <aside className="history_wrapper">
            <HistoryPanel />
          </aside>


          <main className='main_content'>
            <div className='canvas_container'>
              <Canvas />
            </div>
          </main>
        </section>
      </div>
    </DrawingProvider>
  )
}

export default App
