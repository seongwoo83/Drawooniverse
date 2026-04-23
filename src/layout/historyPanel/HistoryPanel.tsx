import HistoryList from "../../components/historyList/HistoryList"
import './HistoryPanel.css'

const HistoryPanel = () => {
  return (
    <div className="history_panel">
      <div className="history_panel_header">History</div>
      <HistoryList />
    </div>
  )
}

export default HistoryPanel;
