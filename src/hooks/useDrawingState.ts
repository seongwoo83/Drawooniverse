import { useState } from "react";
import type { Shape } from "../Types";
import {
    DEFAULT_VIEWPORT,
    ZOOM_STEP,
    clampScale,
} from "../utils/viewport";

export const useDrawingState = () => {
    const [currentLine, setCurrentLine] = useState<Shape | null>(null);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [zIndex, setZIndex] = useState<number>(0);
    const [viewport, setViewport] = useState(DEFAULT_VIEWPORT);

    const zoomIn = () => {
        setViewport((currentViewport) => ({
            ...currentViewport,
            scale: clampScale(currentViewport.scale + ZOOM_STEP),
        }));
    };

    const zoomOut = () => {
        setViewport((currentViewport) => ({
            ...currentViewport,
            scale: clampScale(currentViewport.scale - ZOOM_STEP),
        }));
    };

    const resetViewport = () => {
        setViewport(DEFAULT_VIEWPORT);
    };
    
    return { 
        currentLine, 
        setCurrentLine, 
        isDrawing, 
        setIsDrawing, 
        zIndex, 
        setZIndex,
        viewport,
        setViewport,
        zoomIn,
        zoomOut,
        resetViewport,
    };
};
