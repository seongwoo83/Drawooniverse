import type { JSX } from "react";
import { useDrawing } from "../../hooks/useDrawing";
import type { Tool } from "../../Types";
import './DrawingTools.css'

const tools: Array<{ id: Tool; label: string; icon: JSX.Element }> = [
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
  {
    id: 'eraser',
    label: 'Erase',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M6.4 13.7L11.8 8.3L15.5 12C16.3 12.8 16.3 14.1 15.5 14.9L14.9 15.5C14.1 16.3 12.8 16.3 12 15.5L8.3 11.8L4.9 15.2C4.5 15.6 4 15.8 3.4 15.8H2.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.1 5.3C8.9 4.5 10.2 4.5 11 5.3L12.9 7.2L7.5 12.6L5.6 10.7C4.8 9.9 4.8 8.6 5.6 7.8L8.1 5.3Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round"/>
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
