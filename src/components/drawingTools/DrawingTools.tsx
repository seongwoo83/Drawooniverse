import Button from "../button/Button";
import { useDrawing } from "../../hooks/useDrawing";

import './DrawingTools.css'
const DrawingTools = ()=>{
    const {selectedTool, setSelectedTool} = useDrawing();

    const handleToolClick = (tool: string)=>{
        setSelectedTool(tool);
    }

    return(
        <div className="drawing_tools">
            <Button title="Line" onClick={()=>handleToolClick("line")} isSelected={selectedTool==="line"}/>
            <Button title="Rect" onClick={()=>handleToolClick("rectangle")} isSelected={selectedTool==="rectangle"}/>
            <Button title="Ellipse" onClick={()=>handleToolClick("ellipse")} isSelected={selectedTool==="ellipse"}/>
            <Button title="Poly" onClick={()=>handleToolClick("polygon")} isSelected={selectedTool==="polygon"}/>
            <Button title="Free" onClick={()=>handleToolClick("freehand")} isSelected={selectedTool==="freehand"}/>
        </div>
    )
}

export default DrawingTools;