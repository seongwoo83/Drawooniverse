import KonvaStage from "../../components/konvaStage/KonvaStage"
import './Canvas.css'

const Canvas = ()=>{
    return(
        <div id="Canvas">
            <h3>Canvas</h3>
            <div className="canvas_wrapper">
                <KonvaStage />
            </div>
        </div>
    )
}

export default Canvas;