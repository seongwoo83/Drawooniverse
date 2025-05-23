import { createContext, useContext, useState, useEffect, useRef } from "react";
import { set, get } from "idb-keyval";
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
    const isLoaded = useRef<boolean>(false);

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


    useEffect(() => {
        get('layers').then((savedLayers) => {
            console.log('indexedDB에서 불러온 값:', savedLayers);
            if (Array.isArray(savedLayers)) setLayers(savedLayers);
            isLoaded.current = true;
        });
    }, []);

    useEffect(()=>{
        if(isLoaded.current){
            set('layers', layers);
        }
    }, [layers]);

    return <DrawingContext.Provider value={value}>{children}</DrawingContext.Provider>
}

export const useDrawing = () => {
    const context = useContext(DrawingContext);
    if (!context) {
        throw new Error("useDrawing must be used within a DrawingProvider");
    }
    return context;
}