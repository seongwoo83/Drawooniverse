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
    currentLine: Layer | null;
    setCurrentLine: (line: Layer | null) => void;
    // 레이어
    layers: Layer[];
    setLayers: (layers: Layer[]) => void;
    // 현재 레이어
    currentLayer: Layer | null;
    setCurrentLayer: (layer: Layer | null) => void;
    // zIndex
    zIndex: number;
    setZIndex: (zIndex: number) => void;
    // 그리기 상태
    isDrawing: boolean;
    setIsDrawing: (isDrawing: boolean) => void;
}

interface Layer{
    points?: number[];
    stroke: string;
    strokeWidth: number;
    zIndex: number;
    shapeType: 'line' | 'rectangle' | 'ellipse' | 'polygon';
    x?: number;
    y?: number;
    radiusX?: number;
    radiusY?: number;
    width?: number;
    height?: number;
    radius?: number;
}

export type { ButtonProps, DrawingContextType, Layer };