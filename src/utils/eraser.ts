import type { EllipseShape, EraserDraft, FreehandShape, ImageShape, LineShape, PolygonShape, RectangleShape, Shape } from "../Types";

type Point = {
    x: number;
    y: number;
};

type ImagePreviewCache = {
    sourceImage: HTMLImageElement;
    maskCanvas: HTMLCanvasElement;
    maskContext: CanvasRenderingContext2D;
    compositeCanvas: HTMLCanvasElement;
    compositeContext: CanvasRenderingContext2D;
    scaleX: number;
    scaleY: number;
    dirty: boolean;
};

type EraserSession = {
    baseLayers: Shape[];
    layers: Shape[];
    imageCaches: Map<string, ImagePreviewCache>;
    hasChanges: boolean;
};

const toPoint = (points: number[], index: number): Point => ({
    x: points[index],
    y: points[index + 1],
});

const distanceBetween = (left: Point, right: Point) => Math.hypot(left.x - right.x, left.y - right.y);

const distanceToSegment = (point: Point, start: Point, end: Point) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    if (dx === 0 && dy === 0) {
        return distanceBetween(point, start);
    }

    const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)));
    const projection = {
        x: start.x + t * dx,
        y: start.y + t * dy,
    };

    return distanceBetween(point, projection);
};

const pointsFromDraft = (draft: EraserDraft): Point[] => {
    const result: Point[] = [];

    for (let index = 0; index < draft.points.length - 1; index += 2) {
        result.push(toPoint(draft.points, index));
    }

    return result;
};

const resamplePolyline = (points: number[], spacing: number) => {
    if (points.length < 4) {
        return points;
    }

    const sampled = [points[0], points[1]];

    for (let index = 0; index < points.length - 3; index += 2) {
        const start = toPoint(points, index);
        const end = toPoint(points, index + 2);
        const length = distanceBetween(start, end);
        const steps = Math.max(1, Math.ceil(length / spacing));

        for (let step = 1; step <= steps; step += 1) {
            const t = step / steps;
            sampled.push(
                start.x + (end.x - start.x) * t,
                start.y + (end.y - start.y) * t,
            );
        }
    }

    return sampled;
};

const simplifyRun = (points: number[], spacing: number) => {
    if (points.length <= 4) {
        return points;
    }

    const simplified = [points[0], points[1]];
    let lastPoint = toPoint(points, 0);

    for (let index = 2; index < points.length - 3; index += 2) {
        const nextPoint = toPoint(points, index);
        if (distanceBetween(lastPoint, nextPoint) >= spacing) {
            simplified.push(nextPoint.x, nextPoint.y);
            lastPoint = nextPoint;
        }
    }

    const lastIndex = points.length - 2;
    const endPoint = toPoint(points, lastIndex);
    if (distanceBetween(lastPoint, endPoint) > 0) {
        simplified.push(endPoint.x, endPoint.y);
    }

    return simplified;
};

const splitPolylineByEraser = (points: number[], draft: EraserDraft, shape: FreehandShape | LineShape | PolygonShape): Shape[] => {
    const eraserPoints = pointsFromDraft(draft);
    const sampledPoints = resamplePolyline(points, 1.5);
    const runs: number[][] = [];
    let currentRun: number[] = [];
    let erasedAnyPoint = false;
    const eraseRadius = draft.size / 2 + shape.strokeWidth / 2;

    for (let index = 0; index < sampledPoints.length - 1; index += 2) {
        const point = toPoint(sampledPoints, index);
        const isErased = eraserPoints.some((eraserPoint) => distanceBetween(point, eraserPoint) <= eraseRadius);

        if (isErased) {
            erasedAnyPoint = true;
            if (currentRun.length >= 4) {
                runs.push(currentRun);
            }
            currentRun = [];
            continue;
        }

        currentRun.push(point.x, point.y);
    }

    if (currentRun.length >= 4) {
        runs.push(currentRun);
    }

    if (!erasedAnyPoint) {
        return [shape];
    }

    return runs.map((run, index) => ({
        shapeType: "freehand" as const,
        points: simplifyRun(run, Math.max(1.5, shape.strokeWidth / 2)),
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth,
        zIndex: shape.zIndex + index * 0.001,
    }));
};

const isRectHit = (shape: RectangleShape, draft: EraserDraft) => {
    const left = shape.x;
    const top = shape.y;
    const right = shape.x + shape.width;
    const bottom = shape.y + shape.height;
    const corners = [
        { x: left, y: top },
        { x: right, y: top },
        { x: right, y: bottom },
        { x: left, y: bottom },
    ];
    const edges = [
        [corners[0], corners[1]],
        [corners[1], corners[2]],
        [corners[2], corners[3]],
        [corners[3], corners[0]],
    ] as const;

    return pointsFromDraft(draft).some((point) =>
        edges.some(([start, end]) => distanceToSegment(point, start, end) <= draft.size / 2 + shape.strokeWidth / 2),
    );
};

const ellipseBoundaryPoints = (shape: EllipseShape, samples = 72) => {
    const points: Point[] = [];

    for (let index = 0; index < samples; index += 1) {
        const angle = (Math.PI * 2 * index) / samples;
        points.push({
            x: shape.x + Math.cos(angle) * shape.radiusX,
            y: shape.y + Math.sin(angle) * shape.radiusY,
        });
    }

    return points;
};

const isEllipseHit = (shape: EllipseShape, draft: EraserDraft) => {
    const boundary = ellipseBoundaryPoints(shape);

    return pointsFromDraft(draft).some((point) =>
        boundary.some((boundaryPoint) => distanceBetween(point, boundaryPoint) <= draft.size / 2 + shape.strokeWidth / 2),
    );
};

const isImageHit = (shape: ImageShape, draft: EraserDraft) =>
    pointsFromDraft(draft).some((point) =>
        point.x >= shape.x &&
        point.x <= shape.x + shape.width &&
        point.y >= shape.y &&
        point.y <= shape.y + shape.height,
    );

const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new window.Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Image could not be loaded."));
        image.src = src;
    });

const getImageShapeKey = (shape: ImageShape) =>
    `${shape.shapeType}:${shape.zIndex}:${shape.x}:${shape.y}:${shape.width}:${shape.height}:${shape.imageSrc}`;

const syncCompositeCanvas = (cache: ImagePreviewCache) => {
    cache.compositeContext.clearRect(0, 0, cache.compositeCanvas.width, cache.compositeCanvas.height);
    cache.compositeContext.globalCompositeOperation = "source-over";
    cache.compositeContext.drawImage(cache.sourceImage, 0, 0, cache.compositeCanvas.width, cache.compositeCanvas.height);
    cache.compositeContext.globalCompositeOperation = "destination-in";
    cache.compositeContext.drawImage(cache.maskCanvas, 0, 0);
    cache.compositeContext.globalCompositeOperation = "source-over";
};

const createImagePreviewCache = async (shape: ImageShape): Promise<ImagePreviewCache> => {
    const sourceImage = await loadImage(shape.imageSrc);
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = sourceImage.naturalWidth;
    maskCanvas.height = sourceImage.naturalHeight;

    const maskContext = maskCanvas.getContext("2d");
    if (!maskContext) {
        throw new Error("Mask canvas context is not available.");
    }

    if (shape.imageMaskSrc) {
        const maskImage = await loadImage(shape.imageMaskSrc);
        maskContext.drawImage(maskImage, 0, 0, maskCanvas.width, maskCanvas.height);
    } else {
        maskContext.fillStyle = "#ffffff";
        maskContext.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    }

    const compositeCanvas = document.createElement("canvas");
    compositeCanvas.width = maskCanvas.width;
    compositeCanvas.height = maskCanvas.height;
    const compositeContext = compositeCanvas.getContext("2d");
    if (!compositeContext) {
        throw new Error("Image compositing context is not available.");
    }

    const cache = {
        sourceImage,
        maskCanvas,
        maskContext,
        compositeCanvas,
        compositeContext,
        scaleX: maskCanvas.width / shape.width,
        scaleY: maskCanvas.height / shape.height,
        dirty: false,
    };

    syncCompositeCanvas(cache);

    return cache;
};

const ensureImagePreviewCache = async (session: EraserSession, shape: ImageShape) => {
    const key = getImageShapeKey(shape);
    const existingCache = session.imageCaches.get(key);

    if (existingCache) {
        return existingCache;
    }

    const nextCache = await createImagePreviewCache(shape);
    session.imageCaches.set(key, nextCache);
    return nextCache;
};

const drawMaskSegment = (cache: ImagePreviewCache, shape: ImageShape, draft: EraserDraft) => {
    const maskPoints = draft.points.flatMap((value, index) =>
        index % 2 === 0
            ? [(value - shape.x) * cache.scaleX]
            : [(value - shape.y) * cache.scaleY],
    );

    cache.maskContext.save();
    cache.maskContext.globalCompositeOperation = "destination-out";
    cache.maskContext.lineCap = "round";
    cache.maskContext.lineJoin = "round";
    cache.maskContext.strokeStyle = "rgba(0, 0, 0, 1)";
    cache.maskContext.fillStyle = "rgba(0, 0, 0, 1)";
    cache.maskContext.lineWidth = Math.max(cache.scaleX, cache.scaleY) * draft.size;

    if (maskPoints.length >= 4) {
        cache.maskContext.beginPath();
        cache.maskContext.moveTo(maskPoints[0], maskPoints[1]);
        for (let index = 2; index < maskPoints.length - 1; index += 2) {
            cache.maskContext.lineTo(maskPoints[index], maskPoints[index + 1]);
        }
        cache.maskContext.stroke();
    } else if (maskPoints.length === 2) {
        cache.maskContext.beginPath();
        cache.maskContext.arc(maskPoints[0], maskPoints[1], (Math.max(cache.scaleX, cache.scaleY) * draft.size) / 2, 0, Math.PI * 2);
        cache.maskContext.fill();
    }

    cache.maskContext.restore();
    syncCompositeCanvas(cache);
    cache.dirty = true;
};

const applyEraserToShape = async (shape: Shape, draft: EraserDraft, session: EraserSession): Promise<{ nextShapes: Shape[]; changed: boolean }> => {
    switch (shape.shapeType) {
        case "line":
        case "freehand":
        case "polygon":
            return {
                nextShapes: splitPolylineByEraser(shape.points, draft, shape),
                changed: false,
            };
        case "rectangle":
            return {
                nextShapes: isRectHit(shape, draft) ? [] : [shape],
                changed: false,
            };
        case "ellipse":
            return {
                nextShapes: isEllipseHit(shape, draft) ? [] : [shape],
                changed: false,
            };
        case "image":
            if (!isImageHit(shape, draft)) {
                return {
                    nextShapes: [shape],
                    changed: false,
                };
            }

            drawMaskSegment(await ensureImagePreviewCache(session, shape), shape, draft);
            return {
                nextShapes: [shape],
                changed: true,
            };
        default:
            return {
                nextShapes: [shape],
                changed: false,
            };
    }
};

export const createEraserPreviewSession = (layers: Shape[]): EraserSession => ({
    baseLayers: layers,
    layers: [...layers].sort((left, right) => left.zIndex - right.zIndex),
    imageCaches: new Map<string, ImagePreviewCache>(),
    hasChanges: false,
});

export const warmEraserPreviewSession = async (session: EraserSession) => {
    await Promise.all(
        session.layers
            .filter((layer): layer is ImageShape => layer.shapeType === "image")
            .map((shape) => ensureImagePreviewCache(session, shape)),
    );
};

export const getEraserPreviewImage = (session: EraserSession, shape: ImageShape) =>
    session.imageCaches.get(getImageShapeKey(shape))?.compositeCanvas ?? null;

export const applyEraserSegmentToSession = async (session: EraserSession, draft: EraserDraft) => {
    const nextLayers: Shape[] = [];
    let changed = false;

    for (const layer of session.layers) {
        const { nextShapes, changed: imageChanged } = await applyEraserToShape(layer, draft, session);

        if (nextShapes.length !== 1 || nextShapes[0] !== layer || imageChanged) {
            changed = true;
        }

        nextLayers.push(...nextShapes);
    }

    if (changed) {
        session.layers = nextLayers.sort((left, right) => left.zIndex - right.zIndex);
        session.hasChanges = true;
        return {
            changed: true,
            layers: session.layers,
        };
    }

    return { changed: false, layers: session.layers };
};

export const finalizeEraserPreviewSession = async (session: EraserSession) => {
    const finalizedLayers = session.layers.map((layer) => {
        if (layer.shapeType !== "image") {
            return layer;
        }

        const imageCache = session.imageCaches.get(getImageShapeKey(layer));
        if (!imageCache?.dirty) {
            return layer;
        }

        return {
            ...layer,
            imageMaskSrc: imageCache.maskCanvas.toDataURL("image/png"),
            maskedImageSrc: imageCache.compositeCanvas.toDataURL("image/png"),
        };
    });

    return finalizedLayers.sort((left, right) => left.zIndex - right.zIndex);
};

export const applyEraserToLayers = async (layers: Shape[], draft: EraserDraft) => {
    const session = createEraserPreviewSession(layers);
    await applyEraserSegmentToSession(session, draft);
    return finalizeEraserPreviewSession(session);
};
