import { useState } from "react";
import type { Shape } from "../Types";

export const useHistoryState = () => {
    const [histories, setHistories] = useState<Shape[][]>([[]]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [historyOffset, setHistoryOffset] = useState<number>(0);
    
    const undo = () => {
        if (historyIndex > 0) setHistoryIndex(historyIndex - 1);
    };
    
    const redo = () => {
        if (historyIndex < histories.length - 1) setHistoryIndex(historyIndex + 1);
    };
    
    return { 
        histories, 
        setHistories, 
        historyIndex, 
        setHistoryIndex, 
        historyOffset, 
        setHistoryOffset,
        undo,
        redo
    };
};