import { useEffect } from "react";
import type { Shape } from "../Types";
import { useHistoryState } from "./useHistoryState";
import { useDrawingState } from "./useDrawingState";
import { get, set } from "idb-keyval";
import {
    clampScale,
    isViewportState,
} from "../utils/viewport";

export const useHistoryPersistence = (
    historyState: ReturnType<typeof useHistoryState>,
    drawingState: ReturnType<typeof useDrawingState>,
    isLoaded: React.MutableRefObject<boolean>
) => {
    const {
        histories,
        historyIndex,
        historyOffset,
        setHistories,
        setHistoryIndex,
        setHistoryOffset,
    } = historyState;
    const { viewport, setViewport } = drawingState;

    useEffect(() => {
        Promise.all([get('histories'), get('historyIndex'), get('historyOffset'), get('viewport')]).then(([savedHistories, savedIndex, savedOffset, savedViewport]) => {
            if (Array.isArray(savedHistories)) {
                if (Array.isArray(savedHistories[0])) {
                    setHistories(savedHistories as Shape[][]);
                } else {
                    setHistories([savedHistories as Shape[]]);
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
            if (isViewportState(savedViewport)) {
                setViewport({
                    scale: clampScale(savedViewport.scale),
                    x: savedViewport.x,
                    y: savedViewport.y,
                });
            }
            isLoaded.current = true;
        });
    }, [setHistories, setHistoryIndex, setHistoryOffset, setViewport, isLoaded]);

    useEffect(() => {
        if (isLoaded.current) {
            set('histories', histories);
            set('historyIndex', historyIndex);
            set('historyOffset', historyOffset);
            set('viewport', viewport);
        }
    }, [histories, historyIndex, historyOffset, viewport, isLoaded]);
};
