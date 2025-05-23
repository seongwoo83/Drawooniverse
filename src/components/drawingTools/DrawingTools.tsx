import Button from "../button/Button";
import { useDrawing } from "../../DrawingContext";

import './DrawingTools.css'
const DrawingTools = ()=>{
    const {selectedTool, setSelectedTool} = useDrawing();

    const handleToolClick = (tool: string)=>{
        setSelectedTool(tool);
    }

    return(
        <div className="drawing_tools">
            <Button title="Eraser" onClick={()=>handleToolClick("eraser")} isSelected={selectedTool==="eraser"}/>
            <Button title="Line" onClick={()=>handleToolClick("line")} isSelected={selectedTool==="line"}/>
            <Button title="Rect" onClick={()=>handleToolClick("rectangle")} isSelected={selectedTool==="rectangle"}/>
            <Button title="Ellipse" onClick={()=>handleToolClick("ellipse")} isSelected={selectedTool==="ellipse"}/>
            <Button title="Poly" onClick={()=>handleToolClick("polygon")} isSelected={selectedTool==="polygon"}/>
        </div>
    )
}

export default DrawingTools;