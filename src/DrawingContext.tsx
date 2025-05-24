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
    const [histories, setHistories] = useState<History[][]>([[]]);
    const [historyOffset, setHistoryOffset] = useState<number>(0);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [zIndex, setZIndex] = useState<number>(0);
    const isLoaded = useRef<boolean>(false);

    const layers = histories[historyIndex] || [];
    const MAX_HISTORY = 40;

    const undo = () => {
        if (historyIndex > 0) setHistoryIndex(historyIndex - 1);
    };
    const redo = () => {
        if (historyIndex < histories.length - 1) setHistoryIndex(historyIndex + 1);
    };
    const addHistory = (newHistory: History) => {
        const newHistories = histories.slice(0, historyIndex + 1);
        const nextLayers = [...histories[historyIndex], newHistory];
        let updatedHistroies = [...newHistories, nextLayers];
        let offset = historyOffset;

        if (updatedHistroies.length > MAX_HISTORY) {
            const diff = updatedHistroies.length - MAX_HISTORY;
            updatedHistroies = updatedHistroies.slice(diff);
            offset += diff;
        }
        setHistories(updatedHistroies);
        setHistoryIndex(updatedHistroies.length - 1);
        setHistoryOffset(offset);
    }
    const setCurrentHistory = (index: number) => {
        setHistoryIndex(index);
    };

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
        histories,
        setHistories,
        historyIndex,
        setHistoryIndex,
        historyOffset,
        setCurrentHistory,
        zIndex,
        setZIndex,
        undo,
        redo,
        addHistory,
    }


    useEffect(() => {
        Promise.all([get('histories'), get('historyIndex'), get('historyOffset')]).then(([savedHistories, savedIndex, savedOffset]) => {
            if (Array.isArray(savedHistories)) {
                if (Array.isArray(savedHistories[0])) {
                    setHistories(savedHistories as History[][]);
                } else {
                    setHistories([savedHistories as History[]]);
                }
            }
            if(typeof savedIndex === 'number'){
                setHistoryIndex(savedIndex);
            }else{
                setHistoryIndex(
                    Array.isArray(savedHistories) && savedHistories.length > 0 ? savedHistories.length - 1 : 0
                );
            }
            if(typeof savedOffset === 'number'){
                setHistoryOffset(savedOffset);
            }
            isLoaded.current = true;
        });
    }, []);

    useEffect(() => {
        if (isLoaded.current) {
            set('histories', histories);
            set('historyIndex', historyIndex);
            set('historyOffset', historyOffset);
        }
    }, [histories, historyIndex, historyOffset]);

    return <DrawingContext.Provider value={value}>{children}</DrawingContext.Provider>
}

export const useDrawing = () => {
    const context = useContext(DrawingContext);
    if (!context) {
        throw new Error("useDrawing must be used within a DrawingProvider");
    }
    return context;
}