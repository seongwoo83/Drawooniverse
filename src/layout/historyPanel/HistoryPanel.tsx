import HistoryList from "../../components/historyList/HistoryList"
import './HistoryPanel.css'

const HistoryPanel = ()=>{
    return (
        <div className="history_panel">
            <h3>History</h3>
            <HistoryList />
        </div>
    )
}

export default HistoryPanel;