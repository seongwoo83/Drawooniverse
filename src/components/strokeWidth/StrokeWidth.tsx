import { useDrawing } from "../../DrawingContext";
import './StrokeWidth.css'
const StrokeWidth = ()=>{
    const {strokeWidth, setStrokeWidth} = useDrawing();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
        setStrokeWidth(Number(e.target.value));
    }

    return (
        <div className="stroke_width_wrapper">
            <span className="stroke_width_label">Stroke Width:</span>
            <input type="range" min={5} max={50} value={strokeWidth} onChange={handleChange} />
            <span className="stroke_width_value">{strokeWidth}px</span>
        </div>
    )
}

export default StrokeWidth;