import { useEffect, useRef, useState, type JSX } from "react";
import { Stage, Layer, Line, Rect, Ellipse, Circle } from "react-konva";
import { useDrawing } from "../../hooks/useDrawing";
import { useKonvaEvents } from "../../hooks/useKonvaEvents";
import "./KonvaStage.css"

const KonvaStage = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0
    });

    const { layers, strokeColor, zIndex } = useDrawing();
    const {
        currentPolygon,
        hoverPos,
        isSnaping,
        currentLine,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleStageClick,
        handleStageMouseMove
    } = useKonvaEvents();

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight === 0 ? containerRef.current.parentElement!.offsetHeight - 30 : containerRef.current.offsetHeight
                })
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => {
            window.removeEventListener('resize', updateDimensions)
        }
    }, []);

    return (
        <div className="konva_stage" ref={containerRef}>
            <Stage
                width={dimensions.width}
                height={dimensions.height}
                onMouseDown={handleMouseDown}
                onMouseMove={(e) => {
                    handleMouseMove(e);
                    handleStageMouseMove(e);
                }}
                onMouseUp={handleMouseUp}
                onClick={handleStageClick}
            >
                <Layer>
                    {layers.map((history, index) => {
                        if (history.shapeType === "line" || history.shapeType === "freehand") {
                            return (
                                <Line
                                    key={index}
                                    points={history.points}
                                    stroke={history.stroke}
                                    strokeWidth={history.strokeWidth}
                                    zIndex={history.zIndex}
                                    lineCap="round"
                                    lineJoin="round"
                                />
                            )
                        } else if (history.shapeType === "rectangle") {
                            return (
                                <Rect
                                    key={index}
                                    x={history.x}
                                    y={history.y}
                                    width={history.width}
                                    height={history.height}
                                    stroke={history.stroke}
                                    strokeWidth={history.strokeWidth}
                                    zIndex={history.zIndex}
                                />
                            )
                        } else if (history.shapeType === "ellipse") {
                            return (
                                <Ellipse
                                    key={index}
                                    x={history.x}
                                    y={history.y}
                                    radiusX={history.radiusX!}
                                    radiusY={history.radiusY!}
                                    stroke={history.stroke}
                                    strokeWidth={history.strokeWidth}
                                    zIndex={history.zIndex}
                                />
                            )
                        }else if(history.shapeType === "polygon"){
                            return (
                                <Line 
                                    key={index}
                                    points={history.points}
                                    stroke={history.stroke}
                                    strokeWidth={history.strokeWidth}
                                    zIndex={history.zIndex}
                                    closed={true}
                                    lineCap="round"
                                    lineJoin="round"
                                />
                            )
                        }
                    })}
                    {currentLine && (currentLine.shapeType === "line" || currentLine.shapeType === "freehand") && (
                        <Line
                            points={
                                currentLine.shapeType === "line" ? [currentLine.start!.x, currentLine.start!.y, currentLine.end!.x, currentLine.end!.y] : currentLine.points
                            }
                            stroke={currentLine.stroke}
                            strokeWidth={currentLine.strokeWidth}
                            tension={0.5}
                            lineCap="round"
                            lineJoin="round"
                            zIndex={zIndex}
                        />
                    )}
                    {currentLine && currentLine.shapeType === "rectangle" && (
                        <Rect
                            x={currentLine.width! < 0 ? currentLine.x! + currentLine.width! : currentLine.x!}
                            y={currentLine.height! < 0 ? currentLine.y! + currentLine.height! : currentLine.y!}
                            width={Math.abs(currentLine.width!)}
                            height={Math.abs(currentLine.height!)}
                            stroke={currentLine.stroke}
                            strokeWidth={currentLine.strokeWidth}
                            zIndex={zIndex}
                        />
                    )}
                    {currentLine && currentLine.shapeType === "ellipse" && (
                        <Ellipse
                            x={currentLine.x}
                            y={currentLine.y}
                            radiusX={currentLine.radiusX!}
                            radiusY={currentLine.radiusY!}
                            stroke={currentLine.stroke}
                            strokeWidth={currentLine.strokeWidth}
                            zIndex={zIndex}
                        />
                    )}
                    {currentPolygon && (
                        <>
                            <Line 
                                points={hoverPos ? [...currentPolygon.points, hoverPos.x, hoverPos.y] : currentPolygon.points}
                                stroke={strokeColor}
                                strokeWidth={1}
                                closed={isSnaping}
                                zIndex={zIndex}
                                lineCap="round"
                                lineJoin="round"
                            />
                            {
                                currentPolygon.points.length >= 2 &&
                                currentPolygon.points.reduce((acc: JSX.Element[], val, idx, arr)=>{
                                if(idx % 2 === 0 && arr[idx + 1] !== undefined){
                                    acc.push(
                                        <Circle
                                            key={idx}
                                            x={val}
                                            y={arr[idx + 1]}
                                            radius={6}
                                            fill={strokeColor}
                                            strokeWidth={2}
                                        />
                                    );
                                }
                                return acc;

                                }, [])
                            }
                        </>
                    )}
                </Layer>
            </Stage>
        </div>
    );
};

export default KonvaStage;