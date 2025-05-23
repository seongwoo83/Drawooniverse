import { useEffect, useRef, useState } from "react";
import { Stage, Layer } from "react-konva";
import "./KonvaStage.css"

const KonvaStage = ()=>{
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0
    })

    useEffect(()=>{
        const updateDimensions = ()=>{
            if(containerRef.current){
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight === 0 ? containerRef.current.parentElement!.offsetHeight - 30 : containerRef.current.offsetHeight - 30
                })
            }
        };

        updateDimensions();

        window.addEventListener('resize', updateDimensions);

        return ()=>{
            window.removeEventListener('resize', updateDimensions)
        }
    }, [])

    return (
        <div className="konva_stage" ref={containerRef}>
            <Stage width={dimensions.width} height={dimensions.height}>
                <Layer></Layer>
            </Stage>
        </div>
    )
}

export default KonvaStage;