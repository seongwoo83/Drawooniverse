import Konva from "konva";
import type { EllipseShape, ImageShape, LineShape, PolygonShape, RectangleShape, Shape } from "../Types";

type Bounds = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type RawBounds = {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
};

const EXPORT_FILENAME = "drawing-export.png";

const expandBounds = (bounds: RawBounds, padding: number): RawBounds => ({
    minX: bounds.minX - padding,
    minY: bounds.minY - padding,
    maxX: bounds.maxX + padding,
    maxY: bounds.maxY + padding,
});

const getPointsBounds = (points: number[]): RawBounds | null => {
    if (points.length < 2) {
        return null;
    }

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (let index = 0; index < points.length - 1; index += 2) {
        const x = points[index];
        const y = points[index + 1];

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
    }

    return { minX, minY, maxX, maxY };
};

const getLineBounds = (shape: LineShape): RawBounds => {
    const pointsBounds = getPointsBounds(shape.points);
    const fallbackBounds = {
        minX: Math.min(shape.start.x, shape.end.x),
        minY: Math.min(shape.start.y, shape.end.y),
        maxX: Math.max(shape.start.x, shape.end.x),
        maxY: Math.max(shape.start.y, shape.end.y),
    };

    return expandBounds(pointsBounds ?? fallbackBounds, shape.strokeWidth / 2);
};

const getRectangleBounds = (shape: RectangleShape): RawBounds => {
    const minX = Math.min(shape.x, shape.x + shape.width);
    const minY = Math.min(shape.y, shape.y + shape.height);
    const maxX = Math.max(shape.x, shape.x + shape.width);
    const maxY = Math.max(shape.y, shape.y + shape.height);

    return expandBounds({ minX, minY, maxX, maxY }, shape.strokeWidth / 2);
};

const getEllipseBounds = (shape: EllipseShape): RawBounds => {
    return expandBounds(
        {
            minX: shape.x - shape.radiusX,
            minY: shape.y - shape.radiusY,
            maxX: shape.x + shape.radiusX,
            maxY: shape.y + shape.radiusY,
        },
        shape.strokeWidth / 2,
    );
};

const getPolygonBounds = (shape: PolygonShape): RawBounds | null => {
    const bounds = getPointsBounds(shape.points);
    return bounds ? expandBounds(bounds, shape.strokeWidth / 2) : null;
};

const getImageBounds = (shape: ImageShape): RawBounds => ({
    minX: shape.x,
    minY: shape.y,
    maxX: shape.x + shape.width,
    maxY: shape.y + shape.height,
});

const getShapeBounds = (shape: Shape): RawBounds | null => {
    switch (shape.shapeType) {
        case "line":
            return getLineBounds(shape);
        case "freehand": {
            const bounds = getPointsBounds(shape.points);
            return bounds ? expandBounds(bounds, shape.strokeWidth / 2) : null;
        }
        case "rectangle":
            return getRectangleBounds(shape);
        case "ellipse":
            return getEllipseBounds(shape);
        case "polygon":
            return getPolygonBounds(shape);
        case "image":
            return getImageBounds(shape);
        default:
            return null;
    }
};

const mergeBounds = (left: RawBounds, right: RawBounds): RawBounds => ({
    minX: Math.min(left.minX, right.minX),
    minY: Math.min(left.minY, right.minY),
    maxX: Math.max(left.maxX, right.maxX),
    maxY: Math.max(left.maxY, right.maxY),
});

const translatePoints = (points: number[], offsetX: number, offsetY: number) => {
    const translated: number[] = [];

    for (let index = 0; index < points.length - 1; index += 2) {
        translated.push(points[index] - offsetX, points[index + 1] - offsetY);
    }

    return translated;
};

const loadImageElement = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new window.Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("The image layer could not be prepared for export."));
        image.src = src;
    });

const createNodeForShape = async (shape: Shape, bounds: Bounds) => {
    switch (shape.shapeType) {
        case "line":
        case "freehand":
            return new Konva.Line({
                points: translatePoints(shape.points, bounds.x, bounds.y),
                stroke: shape.stroke,
                strokeWidth: shape.strokeWidth,
                lineCap: "round",
                lineJoin: "round",
            });
        case "rectangle": {
            const x = Math.min(shape.x, shape.x + shape.width) - bounds.x;
            const y = Math.min(shape.y, shape.y + shape.height) - bounds.y;
            return new Konva.Rect({
                x,
                y,
                width: Math.abs(shape.width),
                height: Math.abs(shape.height),
                stroke: shape.stroke,
                strokeWidth: shape.strokeWidth,
            });
        }
        case "ellipse":
            return new Konva.Ellipse({
                x: shape.x - bounds.x,
                y: shape.y - bounds.y,
                radiusX: shape.radiusX,
                radiusY: shape.radiusY,
                stroke: shape.stroke,
                strokeWidth: shape.strokeWidth,
            });
        case "polygon":
            return new Konva.Line({
                points: translatePoints(shape.points, bounds.x, bounds.y),
                stroke: shape.stroke,
                strokeWidth: shape.strokeWidth,
                closed: true,
                lineCap: "round",
                lineJoin: "round",
            });
        case "image": {
            const image = await loadImageElement(shape.imageSrc);
            return new Konva.Image({
                image,
                x: shape.x - bounds.x,
                y: shape.y - bounds.y,
                width: shape.width,
                height: shape.height,
            });
        }
        default:
            return null;
    }
};

const downloadDataUrl = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
};

const createDetachedContainer = () => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-99999px";
    container.style.top = "0";
    container.style.pointerEvents = "none";
    container.style.opacity = "0";
    document.body.appendChild(container);
    return container;
};

const toExportBounds = (bounds: RawBounds): Bounds => {
    const x = Math.floor(bounds.minX);
    const y = Math.floor(bounds.minY);
    const width = Math.max(1, Math.ceil(bounds.maxX) - x);
    const height = Math.max(1, Math.ceil(bounds.maxY) - y);

    return { x, y, width, height };
};

const isRenderableShape = (shape: Shape) => getShapeBounds(shape) !== null;

const getShapesBounds = (shapes: Shape[]): Bounds | null => {
    const mergedBounds = shapes.reduce<RawBounds | null>((acc, shape) => {
        const nextBounds = getShapeBounds(shape);
        if (!nextBounds) {
            return acc;
        }

        return acc ? mergeBounds(acc, nextBounds) : nextBounds;
    }, null);

    return mergedBounds ? toExportBounds(mergedBounds) : null;
};

const exportShapesToTransparentPng = async (shapes: Shape[]) => {
    const renderableShapes = [...shapes]
        .filter(isRenderableShape)
        .sort((left, right) => left.zIndex - right.zIndex);
    const bounds = getShapesBounds(renderableShapes);

    if (!bounds) {
        throw new Error("There is no drawing content to export.");
    }

    const container = createDetachedContainer();
    const stage = new Konva.Stage({
        container,
        width: bounds.width,
        height: bounds.height,
    });
    const layer = new Konva.Layer();
    stage.add(layer);

    try {
        const nodes = await Promise.all(renderableShapes.map((shape) => createNodeForShape(shape, bounds)));
        nodes.forEach((node) => {
            if (node) {
                layer.add(node);
            }
        });
        layer.draw();

        const dataUrl = stage.toDataURL({ pixelRatio: 1 });
        downloadDataUrl(dataUrl, EXPORT_FILENAME);
    } finally {
        stage.destroy();
        container.remove();
    }
};

export { exportShapesToTransparentPng, getShapesBounds };
export type { Bounds };
