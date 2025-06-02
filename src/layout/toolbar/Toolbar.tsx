import DrawingTools from "../../components/drawingTools/DrawingTools";
import ColorPicker from "../../components/colorPicker/ColorPicker";
import StrokeWidth from '../../components/strokeWidth/StrokeWidth';
import Button from '../../components/button/Button';
import { useDrawing } from '../../hooks/useDrawing';
import './Toolbar.css'


const Toolbar = ()=>{
    const {undo, redo} = useDrawing();


    return(
        <div className="toolbar_wrapper">
            <div className="toolbar_leftside">
                <h3 className="toolbar_title">Drawooniverse</h3>
                <Button title="Undo" onClick={undo} isSelected={false}/>
                <Button title="Redo" onClick={redo} isSelected={false}/>
            </div>
            <DrawingTools />
            <ColorPicker />
            <StrokeWidth />
        </div>
    )
}

export default Toolbar;