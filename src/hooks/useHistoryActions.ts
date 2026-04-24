import type { Shape } from "../Types";
import { useHistoryState } from "./useHistoryState";
import { useDrawingState } from "./useDrawingState";
import { DEFAULT_VIEWPORT } from "../utils/viewport";

export const useHistoryActions = (historyState: ReturnType<typeof useHistoryState>, drawingState: ReturnType<typeof useDrawingState>) => {
    const MAX_HISTORY = 40;
    const INITIAL_HISTORIES: Shape[][] = [[]];

    const pushLayers = (nextLayers: Shape[]) => {
        const { histories, setHistories, historyIndex, setHistoryIndex } = historyState;
        void drawingState;

        const newHistories = histories.slice(0, historyIndex + 1);
        let updatedHistroies = [...newHistories, nextLayers];

        if (updatedHistroies.length > MAX_HISTORY) {
            const diff = updatedHistroies.length - MAX_HISTORY;
            updatedHistroies = updatedHistroies.slice(diff);
            historyState.setHistoryOffset(historyState.historyOffset + diff);
        }
        setHistories(updatedHistroies);
        setHistoryIndex(updatedHistroies.length - 1);
    };

    const addHistory = (newHistory: Shape) => {
        const currentLayers = historyState.histories[historyState.historyIndex] ?? [];
        pushLayers([...currentLayers, newHistory]);
    };

    const replaceLayers = (layers: Shape[]) => {
        pushLayers(layers);
    };

    const resetHistory = () => {
        historyState.setHistories(INITIAL_HISTORIES);
        historyState.setHistoryIndex(0);
        historyState.setHistoryOffset(0);
        drawingState.setViewport(DEFAULT_VIEWPORT);
    };
    
    return { addHistory, replaceLayers, resetHistory };
};
