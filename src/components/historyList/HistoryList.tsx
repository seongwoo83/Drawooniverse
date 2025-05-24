import { useDrawing } from "../../DrawingContext";
import './HistoryList.css'

const HistoryList = () => {
    const { histories, setCurrentHistory, historyIndex, historyOffset } = useDrawing();

    const handleHistoryClick = (index: number) => {
        setCurrentHistory(index);
    }

    return (
        <div className="history_list">
            <div className="history_items">
                {histories.slice().reverse().map((_history, index) => {
                    const realIndex = histories.length - 1 - index;
                    const displayNumber = historyOffset + realIndex + 1;
                    return (
                        <div key={realIndex} className={`history_item ${realIndex === historyIndex ? 'selected' : ''} ${realIndex > historyIndex ? 'prev_index' : ''}`} onClick={() => handleHistoryClick(realIndex)}>
                            <span>History {displayNumber}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default HistoryList;