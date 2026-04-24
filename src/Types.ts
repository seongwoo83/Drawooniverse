import type { Dispatch, SetStateAction } from "react";

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

interface ImageShape extends BaseShape {
    shapeType: "image";
    x: number;
    y: number;
    width: number;
    height: number;
    imageSrc: string;
    imageName?: string;
}

type Shape = LineShape | FreehandShape | RectangleShape | EllipseShape | PolygonShape | ImageShape;

interface DrawingContextType {
    selectedTool: string;
    setSelectedTool: (tool: string) => void;
    strokeWidth: number;
    setStrokeWidth: (width: number) => void;
    strokeColor: string;
    setStrokeColor: (color: string) => void;
    currentLine: Shape | null;
    setCurrentLine: (line: Shape | null) => void;
    layers: Shape[];
    histories: Shape[][];
    historyIndex: number;
    setHistoryIndex: (index: number) => void;
    setHistories: (histories: Shape[][]) => void;
    historyOffset: number;
    setCurrentHistory: (index: number) => void;
    zIndex: number;
    setZIndex: (zIndex: number) => void;
    isDrawing: boolean;
    setIsDrawing: (isDrawing: boolean) => void;
    addHistory: (history: Shape) => void;
    resetHistory: () => void;
    undo: () => void;
    redo: () => void;
    viewport: ViewportState;
    setViewport: Dispatch<SetStateAction<ViewportState>>;
    zoomIn: () => void;
    zoomOut: () => void;
    resetViewport: () => void;
    exportToPng: () => Promise<void>;
    canExport: boolean;
}

interface ViewportState {
    scale: number;
    x: number;
    y: number;
}

export type {
    ButtonProps,
    DrawingContextType,
    ViewportState,
    Shape,
    LineShape,
    FreehandShape,
    RectangleShape,
    EllipseShape,
    PolygonShape,
    ImageShape,
};
