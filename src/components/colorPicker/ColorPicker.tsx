import { useDrawing } from "../../hooks/useDrawing";
import './ColorPicker.css'

const ColorPicker = ()=>{
    const { selectedTool, strokeColor, setStrokeColor } = useDrawing();

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
        setStrokeColor(e.target.value);
    }

    return (
        <div className="color_picker">
            <span>{selectedTool === "eraser" ? "Brush Color:" : "Selected Color:"}</span> <input type="color" value={strokeColor} onChange={handleColorChange} disabled={selectedTool === "eraser"} />
        </div>
    )
}

export default ColorPicker;
