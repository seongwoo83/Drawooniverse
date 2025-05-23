import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { DrawingContextType, Layer } from "./Types";

const DrawingContext = createContext<DrawingContextType | undefined>(undefined);

export const DrawingProvider = ({ children }: { children: ReactNode }) => {
    const [selectedTool, setSelectedTool] = useState<string>("line");
    const [strokeWidth, setStrokeWidth] = useState<number>(5);
    const [strokeColor, setStrokeColor] = useState<string>("#000000");
    const [currentLine, setCurrentLine] = useState<Layer | null>(null);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [layers, setLayers] = useState<Layer[]>([]);
    const [currentLayer, setCurrentLayer] = useState<Layer | null>(null);
    const [zIndex, setZIndex] = useState<number>(0);

    const value = {
        selectedTool,
        setSelectedTool,
        strokeWidth,
        setStrokeWidth,
        strokeColor,
        setStrokeColor,
        currentLine,
        setCurrentLine,
        isDrawing,
        setIsDrawing,
        layers,
        setLayers,
        currentLayer,
        setCurrentLayer,
        zIndex,
        setZIndex,
    }

    return <DrawingContext.Provider value={value}>{children}</DrawingContext.Provider>
}

export const useDrawing = () => {
    const context = useContext(DrawingContext);
    if (!context) {
        throw new Error("useDrawing must be used within a DrawingProvider");
    }
    return context;
}