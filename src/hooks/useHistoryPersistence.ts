import { useEffect } from "react";
import type { Shape } from "../Types";
import { useHistoryState } from "./useHistoryState";
import { get, set } from "idb-keyval";

export const useHistoryPersistence = (
    historyState: ReturnType<typeof useHistoryState>,
    isLoaded: React.MutableRefObject<boolean>
) => {
    useEffect(() => {
        Promise.all([get('histories'), get('historyIndex'), get('historyOffset')]).then(([savedHistories, savedIndex, savedOffset]) => {
            if (Array.isArray(savedHistories)) {
                if (Array.isArray(savedHistories[0])) {
                    historyState.setHistories(savedHistories as Shape[][]);
                } else {
                    historyState.setHistories([savedHistories as Shape[]]);
                }
            }
            if(typeof savedIndex === 'number'){
                historyState.setHistoryIndex(savedIndex);
            }else{
                historyState.setHistoryIndex(
                    Array.isArray(savedHistories) && savedHistories.length > 0 ? savedHistories.length - 1 : 0
                );
            }
            if(typeof savedOffset === 'number'){
                historyState.setHistoryOffset(savedOffset);
            }
            isLoaded.current = true;
        });
    }, []);

    useEffect(() => {
        if (isLoaded.current) {
            set('histories', historyState.histories);
            set('historyIndex', historyState.historyIndex);
            set('historyOffset', historyState.historyOffset);
        }
    }, [historyState.histories, historyState.historyIndex, historyState.historyOffset]);
};