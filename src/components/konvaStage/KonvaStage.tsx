import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Rect, Ellipse } from "react-konva";
import { useDrawing } from "../../DrawingContext";
import "./KonvaStage.css"

const KonvaStage = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0
    });

    const {
        selectedTool,
        strokeWidth,
        strokeColor,
        currentLine,
        setCurrentLine,
        layers,
        setLayers,
        isDrawing,
        setIsDrawing,
        zIndex,
        setZIndex
    } = useDrawing();

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
    }, [])

    const handleMouseDown = (e: any) => {
        if (selectedTool === "") return;
        setIsDrawing(true);
        const pos = e.target.getStage().getPointerPosition();

        if (selectedTool === "line") {
            setCurrentLine({
                points: [],
                start: { x: pos.x, y: pos.y },
                end: { x: pos.x, y: pos.y },
                stroke: strokeColor,
                strokeWidth,
                zIndex,
                shapeType: "line"
            });
        } else if (selectedTool === "freehand") {
            setCurrentLine({
                points: [pos.x, pos.y],
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                zIndex: zIndex,
                shapeType: "freehand"
            });
        } else if (selectedTool === "rectangle") {
            setCurrentLine({
                x: pos.x,
                y: pos.y,
                width: 0,
                height: 0,
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                zIndex: zIndex,
                shapeType: "rectangle"
            })
        } else if (selectedTool === "ellipse") {
            setCurrentLine({
                x: pos.x,
                y: pos.y,
                radiusX: 0,
                radiusY: 0,
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                zIndex: zIndex,
                shapeType: "ellipse"
            })
        } else if (selectedTool === "polygon") {

        }
    };

    const handleMouseMove = (e: any) => {
        if (!isDrawing || !currentLine) return;
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();

        if (currentLine.shapeType === "line") {
            const newLine = {
                ...currentLine,
                end: { x: pos.x, y: pos.y }
            };
            setCurrentLine(newLine);
        } else if (currentLine.shapeType === "freehand") {
            const newLine = {
                ...currentLine,
                points: [...(currentLine.points || []), pos.x, pos.y],
            };
            setCurrentLine(newLine);
        } else if (currentLine.shapeType === "rectangle") {
            const newRect = {
                ...currentLine,
                width: pos.x - currentLine.x!,
                height: pos.y - currentLine.y!
            };
            setCurrentLine(newRect);
        } else if (currentLine.shapeType === "ellipse") {
            const dx = pos.x - currentLine.x!;
            const dy = pos.y - currentLine.y!;
            const radius = {
                radiusX: Math.abs(dx),
                radiusY: Math.abs(dy)
            }
            const newEllipse = {
                ...currentLine,
                radiusX: radius.radiusX,
                radiusY: radius.radiusY
            }
            setCurrentLine(newEllipse);
        } else if (currentLine.shapeType === "polygon") {

        }
    };

    const handleMouseUp = () => {
        if (!isDrawing || !currentLine) return;
        setIsDrawing(false);

        let shouldAdd = false;

        if (currentLine.shapeType === "line") {
            const { start, end } = currentLine;
            const dist = Math.sqrt(Math.pow(end!.x - start!.x, 2) + Math.pow(end!.y - start!.y, 2));
            if (dist >= 5) {
                setLayers([...layers, {
                    ...currentLine,
                    points: [start!.x, start!.y, end!.x, end!.y]
                }]);
                setZIndex(zIndex + 1);
            }
        }else if(currentLine.shapeType === "freehand"){
            const pts = currentLine.points;
            if(pts && pts.length >= 4){
                const dx = pts[pts.length - 2] - pts[0];
                const dy = pts[pts.length - 1] - pts[1];
                const dist = Math.sqrt(dx * dx + dy * dy);
                if(dist >= 5){
                    shouldAdd = true;
                }
            }
        }else if (currentLine.shapeType === "rectangle") {
            const width = currentLine.width!;
            const height = currentLine.height!;
            if (width >= 5 && height >= 5) {
                shouldAdd = true;
            }
        } else if (currentLine.shapeType === "ellipse") {
            const radiusX = currentLine.radiusX!;
            const radiusY = currentLine.radiusY!;
            if (radiusX >= 5 && radiusY >= 5) {
                shouldAdd = true;
            }
        } else if (currentLine.shapeType === "polygon") {
            shouldAdd = true;
        }

        if (shouldAdd) {
            setLayers([...layers, { ...currentLine, zIndex }]);
            setZIndex(zIndex + 1);
        }
        setCurrentLine(null);
    };

    return (
        <div className="konva_stage" ref={containerRef}>
            <Stage
                width={dimensions.width}
                height={dimensions.height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                <Layer>
                    {layers.map((layer, index) => {
                        if (layer.shapeType === "line" || layer.shapeType === "freehand") {
                            return (
                                <Line
                                    key={index}
                                    points={layer.points}
                                    stroke={layer.stroke}
                                    strokeWidth={layer.strokeWidth}
                                    zIndex={layer.zIndex}
                                    lineCap="round"
                                    lineJoin="round"
                                />
                            )
                        } else if (layer.shapeType === "rectangle") {
                            return (
                                <Rect
                                    key={index}
                                    x={layer.x}
                                    y={layer.y}
                                    width={layer.width}
                                    height={layer.height}
                                    stroke={layer.stroke}
                                    strokeWidth={layer.strokeWidth}
                                    zIndex={layer.zIndex}
                                />
                            )
                        } else if (layer.shapeType === "ellipse") {
                            return (
                                <Ellipse
                                    key={index}
                                    x={layer.x}
                                    y={layer.y}
                                    radiusX={layer.radiusX!}
                                    radiusY={layer.radiusY!}
                                    stroke={layer.stroke}
                                    strokeWidth={layer.strokeWidth}
                                    zIndex={layer.zIndex}
                                />
                            )
                        } else if (layer.shapeType === "polygon") {

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
                            x={currentLine.x}
                            y={currentLine.y}
                            width={currentLine.width}
                            height={currentLine.height}
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
                </Layer>
            </Stage>
        </div>
    );
};

export default KonvaStage;