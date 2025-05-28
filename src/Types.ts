type ButtonProps = {
    title: string;
    onClick: () => void;
    className?: string;
    isSelected: boolean;
};

interface BaseShape {
    stroke: string;
    strokeWidth: number;
    zIndex: number;
}

interface LineShape extends BaseShape {
    shapeType: "line";
    start: {x: number; y: number};
    end: {x: number; y: number};
    points: [number, number, number, number];
}

interface FreehandShape extends BaseShape {
    shapeType: "freehand";
    points: number[];
}

interface RectangleShape extends BaseShape {
    shapeType: "rectangle";
    x: number;
    y: number;
    width: number;
    height: number;
}

interface EllipseShape extends BaseShape {
    shapeType: "ellipse";
    x: number;
    y: number;
    radiusX: number;
    radiusY: number;
}

interface PolygonShape extends BaseShape {
    shapeType: "polygon";
    points: number[];
}

type Shape = LineShape | FreehandShape | RectangleShape | EllipseShape | PolygonShape;

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
    currentLine: Shape | null;
    setCurrentLine: (line: Shape | null) => void;
    // 레이어
    layers: Shape[];
    // 작업 내역
    histories: Shape[][];
    // 작업 내역 순서
    historyIndex: number;
    setHistoryIndex: (index: number) => void;
    setHistories: (histories: Shape[][]) => void;
    // 작업 내역 오프셋
    historyOffset: number;
    // 현재 작업 내역
    setCurrentHistory: (index: number) => void;
    // zIndex
    zIndex: number;
    setZIndex: (zIndex: number) => void;
    // 그리기 상태
    isDrawing: boolean;
    setIsDrawing: (isDrawing: boolean) => void;
    // 작업 내역 추가
    addHistory: (history: Shape) => void;
    // 되돌리기
    undo: () => void;
    // 다시 실행
    redo: () => void;
}

export type {ButtonProps, DrawingContextType, Shape, LineShape, FreehandShape, RectangleShape, EllipseShape, PolygonShape};