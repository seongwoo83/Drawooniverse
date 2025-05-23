import { createContext, useContext, useState, useEffect, useRef } from "react";
import { set, get } from "idb-keyval";
import type { ReactNode } from "react";
import type { DrawingContextType, History } from "./Types";

const DrawingContext = createContext<DrawingContextType | undefined>(undefined);

export const DrawingProvider = ({ children }: { children: ReactNode }) => {
    const [selectedTool, setSelectedTool] = useState<string>("line");
    const [strokeWidth, setStrokeWidth] = useState<number>(5);
    const [strokeColor, setStrokeColor] = useState<string>("#000000");
    const [currentLine, setCurrentLine] = useState<History | null>(null);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [histories, setHistories] = useState<History[]>([]);
    const [currentHistory, setCurrentHistory] = useState<History | null>(null);
    const [zIndex, setZIndex] = useState<number>(0);
    const isLoaded = useRef<boolean>(false);
    const [undoStack, setUndoStack] = useState<History[][]>([]);
    const [redoStack, setRedoStack] = useState<History[][]>([]);

    const undo = ()=>{
        if(histories.length === 0) return;
        setRedoStack(prev => [...prev, histories]);
        const prevHistories = undoStack[undoStack.length - 1];
        setUndoStack(undoStack.slice(0, -1));
        setHistories(Array.isArray(prevHistories) ? prevHistories : []);
    }
    const redo = ()=>{
        if (redoStack.length === 0) return;
        setUndoStack(prev => [...prev, histories]);
        const nextHistories = redoStack[redoStack.length - 1];
        setRedoStack(redoStack.slice(0, -1));
        setHistories(Array.isArray(nextHistories) ? nextHistories : []);
    }   
    const addHistory = (newHistory: History)=>{
        setUndoStack(prev => [...prev, histories]);
        setRedoStack([]);
        setHistories(prev => [...prev, newHistory]);
    }

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
        histories,
        setHistories,
        currentHistory,
        setCurrentHistory,
        zIndex,
        setZIndex,
        undo,
        redo,
        addHistory,
    }


    useEffect(() => {
        get('histories').then((savedHistories) => {
            if (Array.isArray(savedHistories)){
                setHistories(savedHistories);

                const stack:History[][] = [];
                for(let i = 0; i < savedHistories.length; i++){
                    stack.push(savedHistories.slice(0, i));
                }
                setUndoStack(stack);
            }
            isLoaded.current = true;
        });
    }, []);

    useEffect(()=>{
        if(isLoaded.current){
            set('histories', histories);
        }
    }, [histories]);

    return <DrawingContext.Provider value={value}>{children}</DrawingContext.Provider>
}

export const useDrawing = () => {
    const context = useContext(DrawingContext);
    if (!context) {
        throw new Error("useDrawing must be used within a DrawingProvider");
    }
    return context;
}