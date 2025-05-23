import { useDrawing } from "../../DrawingContext";
import './ColorPicker.css'

const ColorPicker = ()=>{
    const {strokeColor, setStrokeColor} = useDrawing();

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
        setStrokeColor(e.target.value);
    }

    return (
        <div className="color_picker">
            <input type="color" value={strokeColor} onChange={handleColorChange} />
        </div>
    )
}

export default ColorPicker;