import type { Dispatch, SetStateAction } from "react";

type Tool =
    | "line"
    | "rectangle"
    | "ellipse"
    | "polygon"
    | "freehand"
    | "eraser";

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
    maskedImageSrc?: string;
    imageMaskSrc?: string;
    imageName?: string;
}

type Shape = LineShape | FreehandShape | RectangleShape | EllipseShape | PolygonShape | ImageShape;

interface EraserDraft {
    shapeType: "eraser";
    points: number[];
    size: number;
}

type CurrentDraft = Shape | EraserDraft;

interface DrawingContextType {
    selectedTool: Tool;
    setSelectedTool: (tool: Tool) => void;
    strokeWidth: number;
    setStrokeWidth: (width: number) => void;
    strokeColor: string;
    setStrokeColor: (color: string) => void;
    currentLine: CurrentDraft | null;
    setCurrentLine: (line: CurrentDraft | null) => void;
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
    replaceLayers: (layers: Shape[]) => void;
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
    Tool,
    Shape,
    CurrentDraft,
    EraserDraft,
    LineShape,
    FreehandShape,
    RectangleShape,
    EllipseShape,
    PolygonShape,
    ImageShape,
};
