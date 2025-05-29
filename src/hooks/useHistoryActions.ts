import type { Shape } from "../Types";
import { useHistoryState } from "./useHistoryState";
import { useDrawingState } from "./useDrawingState";

export const useHistoryActions = (historyState: ReturnType<typeof useHistoryState>, drawingState: ReturnType<typeof useDrawingState>) => {
    const MAX_HISTORY = 40;

    const addHistory = (newHistory: Shape) => {
        const { histories, setHistories, historyIndex, setHistoryIndex } = historyState;
        const { zIndex, setZIndex } = drawingState;

        const newHistories = histories.slice(0, historyIndex + 1);
        const nextLayers = [...histories[historyIndex], newHistory];
        let updatedHistroies = [...newHistories, nextLayers];

        if (updatedHistroies.length > MAX_HISTORY) {
            const diff = updatedHistroies.length - MAX_HISTORY;
            updatedHistroies = updatedHistroies.slice(diff);
            historyState.setHistoryOffset(historyState.historyOffset + diff);
        }
        setHistories(updatedHistroies);
        setHistoryIndex(updatedHistroies.length - 1);
        setZIndex(zIndex + 1);
    };
    
    return { addHistory };
};