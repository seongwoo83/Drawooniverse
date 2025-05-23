import DrawingTools from "../../components/drawingTools/DrawingTools";
import ColorPicker from "../../components/colorPicker/ColorPicker";
import StrokeWidth from '../../components/strokeWidth/StrokeWidth';
import './Toolbar.css'


const Toolbar = ()=>{
    return(
        <div className="toolbar_wrapper">
            <h3 className="toolbar_title">Draw It</h3>
            <DrawingTools />
            <ColorPicker />
            <StrokeWidth />
        </div>
    )
}

export default Toolbar;