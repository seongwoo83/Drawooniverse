import type { KonvaEventObject } from "konva/lib/Node";
import { useDrawing } from './useDrawing';
import { useMouseEvents } from './useMouseEvents';

export const useStageEvents = () => {
    const {
        currentPolygon,
        hoverPos,
        isSnaping,
        setCurrentPolygon,
        setIsSnaping,
        setHoverPos
    } = useMouseEvents();

    const {
        selectedTool,
        strokeWidth,
        strokeColor,
        zIndex,
        setZIndex,
        addHistory,
    } = useDrawing();

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
        handleStageClick,
        handleStageMouseMove
    };
}; 