import { useMouseEvents } from './useMouseEvents';
import { useStageEvents } from './useStageEvents';

export const useKonvaEvents = () => {
    const {
        currentLine,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp
    } = useMouseEvents();

    const {
        currentPolygon,
        hoverPos,
        isSnaping,
        handleStageClick,
        handleStageMouseMove
    } = useStageEvents();

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