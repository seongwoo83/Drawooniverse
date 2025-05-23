import { useState } from "react";
import './StrokeWidth.css'
const StrokeWidth = ()=>{

    const [strokeWidth, setStrokeWidth] = useState(5);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
        setStrokeWidth(Number(e.target.value));
    }

    return (
        <div className="stroke_width_wrapper">
            <input type="range" min={5} max={50} value={strokeWidth} onChange={handleChange} />
            <span>width:{strokeWidth}</span>
        </div>
    )
}

export default StrokeWidth;