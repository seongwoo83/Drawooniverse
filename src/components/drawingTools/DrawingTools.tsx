import Button from "../button/Button";
import './DrawingTools.css'
const DrawingTools = ()=>{
    return(
        <div className="drawing_tools">
            <Button title="지우개" onClick={()=>{}} />
            <Button title="선" onClick={()=>{}} />
            <Button title="사각형" onClick={()=>{}} />
            <Button title="원" onClick={()=>{}} />
            <Button title="다각형" onClick={()=>{}} />
            <Button title="자유그리기" onClick={()=>{}} />
        </div>
    )
}

export default DrawingTools;