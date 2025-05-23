import { useDrawing } from "../../DrawingContext";
import type { History } from "../../Types";
import './HistoryList.css'

const HistoryList = ()=>{
    const {histories, setCurrentHistory} = useDrawing();

    const handleHistoryClick = (history: History)=>{
        setCurrentHistory(history);
    }

    return(
        <div className="history_list">
            <div className="history_items">
                {(Array.isArray(histories) ? histories : []).map((history, index) => (
                    <div key={index} className="history_item" onClick={()=>handleHistoryClick(history)}>
                        <span>History {histories.length - index}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default HistoryList;