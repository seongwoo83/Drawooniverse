import type { ViewportState } from "../Types";

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.1;
const DEFAULT_VIEWPORT: ViewportState = { scale: 1, x: 0, y: 0 };
const PAN_MARGIN = 48;

type Size = {
    width: number;
    height: number;
};

type Point = {
    x: number;
    y: number;
};

const roundScale = (scale: number) => Number(scale.toFixed(2));

const clampScale = (scale: number) => {
    return roundScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale)));
};

const screenToWorld = (point: Point, viewport: ViewportState): Point => {
    return {
        x: (point.x - viewport.x) / viewport.scale,
        y: (point.y - viewport.y) / viewport.scale,
    };
};

const clampViewportPosition = (viewport: ViewportState, size: Size): ViewportState => {
    if (size.width <= 0 || size.height <= 0) {
        return viewport;
    }

    const scaledWidth = size.width * viewport.scale;
    const scaledHeight = size.height * viewport.scale;

    if (viewport.scale <= 1) {
        return {
            ...viewport,
            x: (size.width - scaledWidth) / 2,
            y: (size.height - scaledHeight) / 2,
        };
    }

    const panPaddingX = Math.max(PAN_MARGIN, size.width);
    const panPaddingY = Math.max(PAN_MARGIN, size.height);
    const minX = size.width - scaledWidth - panPaddingX;
    const maxX = panPaddingX;
    const minY = size.height - scaledHeight - panPaddingY;
    const maxY = panPaddingY;

    return {
        ...viewport,
        x: Math.min(maxX, Math.max(minX, viewport.x)),
        y: Math.min(maxY, Math.max(minY, viewport.y)),
    };
};

const computeZoomedViewport = (
    viewport: ViewportState,
    nextScale: number,
    anchor: Point,
    size: Size,
): ViewportState => {
    const clampedScale = clampScale(nextScale);
    const worldPoint = screenToWorld(anchor, viewport);

    return clampViewportPosition(
        {
            scale: clampedScale,
            x: anchor.x - worldPoint.x * clampedScale,
            y: anchor.y - worldPoint.y * clampedScale,
        },
        size,
    );
};

const isViewportState = (value: unknown): value is ViewportState => {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const candidate = value as Record<string, unknown>;
    return (
        typeof candidate.scale === "number" &&
        Number.isFinite(candidate.scale) &&
        typeof candidate.x === "number" &&
        Number.isFinite(candidate.x) &&
        typeof candidate.y === "number" &&
        Number.isFinite(candidate.y)
    );
};

export {
    DEFAULT_VIEWPORT,
    MAX_SCALE,
    MIN_SCALE,
    ZOOM_STEP,
    clampScale,
    clampViewportPosition,
    computeZoomedViewport,
    isViewportState,
    screenToWorld,
};

export type { Point, Size };
