import { useDrawing } from "../../hooks/useDrawing";
import './DrawingTools.css'

const tools = [
  {
    id: 'line',
    label: 'Line',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <line x1="4" y1="16" x2="16" y2="4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    id: 'rectangle',
    label: 'Rect',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3.5" y="5.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.75"/>
      </svg>
    )
  },
  {
    id: 'ellipse',
    label: 'Ellipse',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <ellipse cx="10" cy="10" rx="7" ry="5" stroke="currentColor" strokeWidth="1.75"/>
      </svg>
    )
  },
  {
    id: 'polygon',
    label: 'Poly',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <polygon points="10,3 17,8 14.5,16.5 5.5,16.5 3,8" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    id: 'freehand',
    label: 'Free',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 15 C5 11, 8 7, 10 9 C12 11, 14 6, 17 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" fill="none"/>
      </svg>
    )
  },
]

const DrawingTools = () => {
  const { selectedTool, setSelectedTool } = useDrawing();

  return (
    <div className="drawing_tools">
      {tools.map(tool => (
        <button
          key={tool.id}
          className={`tool_btn ${selectedTool === tool.id ? 'selected' : ''}`}
          onClick={() => setSelectedTool(tool.id)}
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  )
}

export default DrawingTools;
