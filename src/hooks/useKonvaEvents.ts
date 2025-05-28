import { useState } from 'react';
import type { KonvaEventObject } from "konva/lib/Node";
import { useDrawing } from './useDrawing';

export const useKonvaEvents = () => {
    const [currentPolygon, setCurrentPolygon] = useState<{ points: number[], isDrawing: boolean } | null>(null);
    const [hoverPos, setHoverPos] = useState<{x: number, y: number} | null>(null);
    const [isSnaping, setIsSnaping] = useState(false);

    const {
        selectedTool,
        strokeWidth,
        strokeColor,
        currentLine,
        setCurrentLine,
        isDrawing,
        setIsDrawing,
        zIndex,
        setZIndex,
        addHistory,
    } = useDrawing();


    const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
        if (selectedTool === "") return;
        setIsDrawing(true);
        const stage = e.target.getStage();
        if (!stage) return;
        const pos = stage.getPointerPosition();
        if (!pos) return;

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

    const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
        if (!isDrawing || !currentLine) return;
        const stage = e.target.getStage();
        if (!stage) return;
        const pos = stage.getPointerPosition();
        if (!pos) return;

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
            const width = Math.abs(currentLine.width!);
            const height = Math.abs(currentLine.height!);
            if (width >= 5 && height >= 5) {
                shouldAdd = true;
                addHistory({
                    ...currentLine,
                    x: currentLine.width! < 0 ? currentLine.x! + currentLine.width! : currentLine.x!,
                    y: currentLine.height! < 0 ? currentLine.y! + currentLine.height! : currentLine.y!,
                    width: width,
                    height: height,
                    zIndex
                });
                setZIndex(zIndex + 1);
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


    const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
        if(selectedTool !== "polygon") return;
        const stage = e.target.getStage();
        if (!stage) return;
        const pos = stage.getPointerPosition();
        if (!pos) return;
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

    const handleStageMouseMove = (e: KonvaEventObject<MouseEvent>) => {
        if(selectedTool === "polygon" && currentPolygon && currentPolygon.isDrawing){
            const stage = e.target.getStage();
            if (!stage) return;
            const pos = stage.getPointerPosition();
            if (!pos) return;

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

    return {
        currentPolygon,
        hoverPos,
        isSnaping,
        currentLine,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleStageClick,
        handleStageMouseMove
    };
};