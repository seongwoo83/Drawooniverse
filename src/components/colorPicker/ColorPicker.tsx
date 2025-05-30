import { useDrawing } from "../../hooks/useDrawing";
import './ColorPicker.css'

const ColorPicker = ()=>{
    const {strokeColor, setStrokeColor} = useDrawing();

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
        setStrokeColor(e.target.value);
    }

    return (
        <div className="color_picker">
            <span>Selected Color:</span> <input type="color" value={strokeColor} onChange={handleColorChange} />
        </div>
    )
}

export default ColorPicker;