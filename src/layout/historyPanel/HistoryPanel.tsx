import { useDrawing } from "../../hooks/useDrawing";
import HistoryList from "../../components/historyList/HistoryList"
import './HistoryPanel.css'

const HistoryPanel = () => {
  const { histories, historyOffset, resetHistory } = useDrawing();
  const isResetDisabled = historyOffset === 0 && histories.length === 1 && histories[0]?.length === 0;

  const handleReset = () => {
    if (isResetDisabled) {
      return;
    }

    const isConfirmed = window.confirm("Clear the full history and start again from History 1?");

    if (isConfirmed) {
      resetHistory();
    }
  };

  return (
    <div className="history_panel">
      <div className="history_panel_header">
        <span>History</span>
        <button
          className="history_panel_reset"
          type="button"
          onClick={handleReset}
          disabled={isResetDisabled}
          title="Reset history"
        >
          Reset
        </button>
      </div>
      <HistoryList />
    </div>
  )
}

export default HistoryPanel;
