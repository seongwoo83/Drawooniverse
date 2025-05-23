type ButtonProps = {
    title: string;
    onClick: () => void;
    className?: string;
    isSelected: boolean;
}

interface DrawingContextType {
    // 선택된 도구
    selectedTool: string;
    setSelectedTool: (tool: string) => void;
    // 선 너비
    strokeWidth: number;
    setStrokeWidth: (width: number) => void;
    // 선 색상
    strokeColor: string;
    setStrokeColor: (color: string) => void;
    // 현재 선
    currentLine: History | null;
    setCurrentLine: (line: History | null) => void;
    // 레이어
    histories: History[];
    setHistories: (histories: History[]) => void;
    // 현재 레이어
    currentHistory: History | null;
    setCurrentHistory: (history: History | null) => void;
    // zIndex
    zIndex: number;
    setZIndex: (zIndex: number) => void;
    // 그리기 상태
    isDrawing: boolean;
    setIsDrawing: (isDrawing: boolean) => void;
    // 추가 레이어
    addHistory: (history: History) => void;
    // 되돌리기
    undo: () => void;
    // 다시 실행
    redo: () => void;
}

interface History{
    points?: number[];
    start?: {x: number, y: number};
    end?: {x: number, y: number};
    stroke: string;
    strokeWidth: number;
    zIndex: number;
    shapeType: 'line' | 'rectangle' | 'ellipse' | 'polygon' | 'freehand';
    x?: number;
    y?: number;
    radiusX?: number;
    radiusY?: number;
    width?: number;
    height?: number;
    radius?: number;
}

export type { ButtonProps, DrawingContextType, History };