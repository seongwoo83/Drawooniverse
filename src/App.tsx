import './App.css'
import Toolbar from './layout/toolbar/Toolbar'
import LayerPanel from './layout/layerPanel/LayerPanel'
import Canvas from './layout/canvas/Canvas'
import { DrawingProvider } from './DrawingContext'

function App() {

  return (
    <DrawingProvider>
      <div className="app_container">
        <header className='toolbar'>
          <Toolbar />
        </header>


        <section className='content_section'>
          <aside className="layer_wrapper">
            <LayerPanel />
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
