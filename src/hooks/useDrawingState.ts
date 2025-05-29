import { useState } from "react";
import type { Shape } from "../Types";

export const useDrawingState = () => {
    const [currentLine, setCurrentLine] = useState<Shape | null>(null);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [zIndex, setZIndex] = useState<number>(0);
    
    return { 
        currentLine, 
        setCurrentLine, 
        isDrawing, 
        setIsDrawing, 
        zIndex, 
        setZIndex 
    };
};