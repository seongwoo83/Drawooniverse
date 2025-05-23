import { useEffect, useRef, useState, type JSX } from "react";
import { Stage, Layer, Line, Rect, Ellipse, Circle } from "react-konva";
import { useDrawing } from "../../DrawingContext";
import "./KonvaStage.css"

const KonvaStage = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0
    });
    const [currentPolygon, setCurrentPolygon] = useState<{ points: number[], isDrawing: boolean } | null>(null);
    const [hoverPos, setHoverPos] = useState<{x: number, y: number} | null>(null);
    const [isSnaping, setIsSnaping] = useState(false);

    const {
        selectedTool,
        strokeWidth,
        strokeColor,
        currentLine,
        setCurrentLine,
        histories,
        isDrawing,
        setIsDrawing,
        zIndex,
        setZIndex,
        addHistory
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
                addHistory({
                    ...currentLine,
                    points: [start!.x, start!.y, end!.x, end!.y]
                });
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
        }
        if (shouldAdd) {
            addHistory({ ...currentLine, zIndex });
            setZIndex(zIndex + 1);
        }
        setCurrentLine(null);
    };


    const handleStageClick = (e: any) => {
        if(selectedTool !== "polygon") return;
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        if(!currentPolygon){
            setCurrentPolygon({
                points: [pos.x, pos.y],
                isDrawing: true
            })
        }else{
            const points = currentPolygon.points;
            const dx = pos.x - points[0];
            const dy = pos.y - points[1];
            const dist = Math.sqrt(dx * dx + dy * dy);
            if(dist < 10 && points.length >= 6){
                addHistory({
                    points: [...points, points[0], points[1]],
                    stroke: strokeColor,
                    strokeWidth: strokeWidth,
                    zIndex: zIndex,
                    shapeType: "polygon"
                });
                setZIndex(zIndex + 1);
                setCurrentPolygon(null);
                setIsSnaping(false);
                setHoverPos(null);
            }else{
                const newPolygon = {
                    ...currentPolygon,
                    points: [...points, pos.x, pos.y]
                }
                setCurrentPolygon(newPolygon);
            }
        }
    }

    const handleStageMouseMove = (e: any) => {
        if(selectedTool === "polygon" && currentPolygon && currentPolygon.isDrawing){
            const stage = e.target.getStage();
            const pos = stage.getPointerPosition();
            const points = currentPolygon.points;
            if(points.length >= 2){
                const dx = pos.x - points[0];
                const dy = pos.y - points[1];
                const dist = Math.sqrt(dx * dx + dy * dy);
                if(dist < 10){
                    setIsSnaping(true);
                    setHoverPos({x: points[0], y: points[1]});
                }else{
                    setIsSnaping(false);
                    setHoverPos(pos);
                }
            }else{
                setIsSnaping(false);
                setHoverPos(pos);
            }
        }
    }


    return (
        <div className="konva_stage" ref={containerRef}>
            <Stage
                width={dimensions.width}
                height={dimensions.height}
                onMouseDown={handleMouseDown}
                onMouseMove={(e)=>{
                    handleMouseMove(e);
                    handleStageMouseMove(e);
                }}
                onMouseUp={handleMouseUp}
                onClick={handleStageClick}
            >
                <Layer>
                    {histories.map((history, index) => {
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
                    {
                        selectedTool === "polygon" && currentPolygon && (
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
                        )
                    }
                </Layer>
            </Stage>
        </div>
    );
};

export default KonvaStage;