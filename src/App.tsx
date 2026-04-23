import './App.css'
import Toolbar from './layout/toolbar/Toolbar'
import HistoryPanel from './layout/historyPanel/HistoryPanel'
import Canvas from './layout/canvas/Canvas'
import { DrawingProvider } from './providers/DrawingProvider'
import DrawingTools from './components/drawingTools/DrawingTools'

function App() {
  return (
    <DrawingProvider>
      <div className="app_container">
        <header className="top_bar">
          <Toolbar />
        </header>
        <section className="workspace">
          <aside className="tool_rail">
            <DrawingTools />
          </aside>
          <main className="canvas_area">
            <Canvas />
          </main>
          <aside className="history_panel_wrapper">
            <HistoryPanel />
          </aside>
        </section>
      </div>
    </DrawingProvider>
  )
}

export default App
