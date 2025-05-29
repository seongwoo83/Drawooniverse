import { useRef, type ReactNode } from "react";
import type { Shape } from "../Types";
import { DrawingContext } from "../context/DrawingContext";
import { useToolState } from "../hooks/useToolState";
import { useHistoryState } from "../hooks/useHistoryState";
import { useDrawingState } from "../hooks/useDrawingState";
import { useHistoryActions } from "../hooks/useHistoryActions";
import { useHistoryPersistence } from "../hooks/useHistoryPersistence";

export const DrawingProvider = ({ children }: { children: ReactNode }) => {
    const toolState = useToolState();
    const historyState = useHistoryState();
    const drawingState = useDrawingState();
    const historyActions = useHistoryActions(historyState, drawingState);
    const isLoaded = useRef<boolean>(false);

    const layers = historyState.histories[historyState.historyIndex] || [];

    const addHistory = (newHistory: Shape) => {
        historyActions.addHistory(newHistory);
    };

    const setCurrentHistory = (index: number) => {
        historyState.setHistoryIndex(index);
    };

    useHistoryPersistence(historyState, isLoaded);

    const value = {
        ...toolState,
        ...historyState,
        ...drawingState,
        layers,
        setCurrentHistory,
        addHistory,
    }

    return <DrawingContext.Provider value={value}>{children}</DrawingContext.Provider>

} 