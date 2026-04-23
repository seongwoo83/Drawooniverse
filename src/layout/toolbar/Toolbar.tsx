import ColorPicker from '../../components/colorPicker/ColorPicker';
import StrokeWidth from '../../components/strokeWidth/StrokeWidth';
import { useDrawing } from '../../hooks/useDrawing';
import { MAX_SCALE, MIN_SCALE } from '../../utils/viewport';
import './Toolbar.css'

const UndoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 6H9.5C11.433 6 13 7.567 13 9.5S11.433 13 9.5 13H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M6 3.5L3.5 6L6 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const RedoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M12 6H6.5C4.567 6 3 7.567 3 9.5S4.567 13 6.5 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 3.5L12.5 6L10 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ZoomOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4.5 8H11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const ZoomInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4.5 8H11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 4.5V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const ResetViewIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="3.5" y="3.5" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 5.75V10.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5.75 8H10.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const Toolbar = () => {
  const { undo, redo, viewport, zoomIn, zoomOut, resetViewport } = useDrawing();
  const zoomPercent = Math.round(viewport.scale * 100);

  return (
    <div className="toolbar_wrapper">
      <div className="toolbar_left">
        <h1 className="toolbar_title">draw it</h1>
      </div>
      <div className="toolbar_right">
        <button className="icon_btn" onClick={undo} title="Undo">
          <UndoIcon />
        </button>
        <button className="icon_btn" onClick={redo} title="Redo">
          <RedoIcon />
        </button>
        <div className="toolbar_divider" />
        <div className="zoom_controls" aria-label="Canvas zoom controls">
          <button className="icon_btn" onClick={zoomOut} title="Zoom Out" disabled={viewport.scale <= MIN_SCALE}>
            <ZoomOutIcon />
          </button>
          <button className="zoom_readout" onClick={resetViewport} title="Reset View">
            {zoomPercent}%
          </button>
          <button className="icon_btn" onClick={zoomIn} title="Zoom In" disabled={viewport.scale >= MAX_SCALE}>
            <ZoomInIcon />
          </button>
          <button className="icon_btn" onClick={resetViewport} title="Reset View">
            <ResetViewIcon />
          </button>
        </div>
        <div className="toolbar_divider" />
        <ColorPicker />
        <div className="toolbar_divider toolbar_divider_compact" />
        <StrokeWidth />
      </div>
    </div>
  )
}

export default Toolbar;
