import { useEffect, useRef, useState, type DragEvent, type JSX } from "react";
import { Stage, Layer, Line, Rect, Ellipse, Circle, Image as KonvaImage } from "react-konva";
import type { Stage as KonvaStageType } from "konva/lib/Stage";
import type { KonvaEventObject } from "konva/lib/Node";
import { useDrawing } from "../../DrawingContext";
import type { History, ViewportState } from "../../Types";
import {
    DEFAULT_VIEWPORT,
    MAX_SCALE,
    MIN_SCALE,
    ZOOM_STEP,
    clampScale,
    clampViewportPosition,
    computeZoomedViewport,
    screenToWorld,
    type Point,
    type Size,
} from "../../utils/viewport";
import "./KonvaStage.css"

type PolygonDraft = {
    points: number[];
    isDrawing: boolean;
};

type NativeMouseEvent = MouseEvent;
type NativeWheelEvent = WheelEvent;
type GridLine = {
    key: string;
    points: number[];
    isMajor: boolean;
};

const GRID_SIZE = 40;
const GRID_MAJOR_EVERY = 5;
const GRID_OVERSCAN = 2;
const MAX_IMAGE_DROP_SIZE = 12 * 1024 * 1024;

const isSameViewport = (a: ViewportState, b: ViewportState) => {
    return a.scale === b.scale && a.x === b.x && a.y === b.y;
};

const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    return ["INPUT", "BUTTON", "SELECT", "TEXTAREA"].includes(target.tagName);
};

const getPointerWorldPosition = (stage: KonvaStageType, viewport: ViewportState): Point | null => {
    const pointer = stage.getPointerPosition();

    if (!pointer) {
        return null;
    }

    return screenToWorld(pointer, viewport);
};

const getDroppedImageData = (file: File) => {
    return new Promise<{ src: string; width: number; height: number }>((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = () => reject(new Error("Failed to read the dropped image."));
        reader.onload = () => {
            const src = typeof reader.result === "string" ? reader.result : "";
            if (!src) {
                reject(new Error("The dropped file could not be converted into an image."));
                return;
            }

            const image = new window.Image();
            image.onload = () => {
                resolve({
                    src,
                    width: image.naturalWidth,
                    height: image.naturalHeight,
                });
            };
            image.onerror = () => reject(new Error("The dropped file is not a valid image."));
            image.src = src;
        };

        reader.readAsDataURL(file);
    });
};

const fitDroppedImage = (width: number, height: number, viewport: ViewportState, size: Size) => {
    const visibleWidth = size.width / viewport.scale;
    const visibleHeight = size.height / viewport.scale;
    const maxWidth = visibleWidth * 0.72;
    const maxHeight = visibleHeight * 0.72;
    const ratio = Math.min(1, maxWidth / width, maxHeight / height);

    return {
        width: Math.max(48, Math.round(width * ratio)),
        height: Math.max(48, Math.round(height * ratio)),
    };
};

const CanvasImageShape = ({ history }: { history: History }) => {
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        if (!history.imageSrc) {
            setImage(null);
            return;
        }

        const nextImage = new window.Image();
        nextImage.onload = () => setImage(nextImage);
        nextImage.src = history.imageSrc;

        return () => {
            nextImage.onload = null;
        };
    }, [history.imageSrc]);

    if (!image) {
        return null;
    }

    return (
        <KonvaImage
            image={image}
            x={history.x}
            y={history.y}
            width={history.width}
            height={history.height}
        />
    );
};

const buildGridLines = (viewport: ViewportState, size: Size): GridLine[] => {
    if (size.width <= 0 || size.height <= 0) {
        return [];
    }

    const left = -viewport.x / viewport.scale;
    const top = -viewport.y / viewport.scale;
    const right = (size.width - viewport.x) / viewport.scale;
    const bottom = (size.height - viewport.y) / viewport.scale;

    const startColumn = Math.floor(left / GRID_SIZE) - GRID_OVERSCAN;
    const endColumn = Math.ceil(right / GRID_SIZE) + GRID_OVERSCAN;
    const startRow = Math.floor(top / GRID_SIZE) - GRID_OVERSCAN;
    const endRow = Math.ceil(bottom / GRID_SIZE) + GRID_OVERSCAN;

    const lines: GridLine[] = [];

    for (let column = startColumn; column <= endColumn; column += 1) {
        const x = column * GRID_SIZE;
        lines.push({
            key: `grid-x-${column}`,
            points: [x, top - GRID_SIZE * GRID_OVERSCAN, x, bottom + GRID_SIZE * GRID_OVERSCAN],
            isMajor: column % GRID_MAJOR_EVERY === 0,
        });
    }

    for (let row = startRow; row <= endRow; row += 1) {
        const y = row * GRID_SIZE;
        lines.push({
            key: `grid-y-${row}`,
            points: [left - GRID_SIZE * GRID_OVERSCAN, y, right + GRID_SIZE * GRID_OVERSCAN, y],
            isMajor: row % GRID_MAJOR_EVERY === 0,
        });
    }

    return lines;
};

const KonvaStage = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const prevViewportRef = useRef<ViewportState>(DEFAULT_VIEWPORT);
    const didPanRef = useRef(false);
    const [dimensions, setDimensions] = useState<Size>({
        width: 0,
        height: 0
    });
    const [currentPolygon, setCurrentPolygon] = useState<PolygonDraft | null>(null);
    const [hoverPos, setHoverPos] = useState<Point | null>(null);
    const [isSnaping, setIsSnaping] = useState(false);
    const [isSpacePressed, setIsSpacePressed] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState<{ pointer: Point; viewport: ViewportState } | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [dropError, setDropError] = useState<string | null>(null);
    const dragDepthRef = useRef(0);

    const {
        selectedTool,
        strokeWidth,
        strokeColor,
        currentLine,
        setCurrentLine,
        isDrawing,
        setIsDrawing,
        zIndex,
        setZIndex,
        addHistory,
        layers,
        viewport,
        setViewport,
    } = useDrawing();

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight === 0 ? containerRef.current.parentElement!.offsetHeight - 30 : containerRef.current.offsetHeight
                })
            }
        };

        updateDimensions();

        window.addEventListener('resize', updateDimensions);

        return () => {
            window.removeEventListener('resize', updateDimensions)
        }
    }, [])

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.code !== "Space" || event.repeat || isInteractiveTarget(event.target)) {
                return;
            }

            event.preventDefault();
            setIsSpacePressed(true);
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.code !== "Space") {
                return;
            }

            setIsSpacePressed(false);
            setIsPanning(false);
            setPanStart(null);
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) {
            return;
        }

        setViewport((currentViewport) => {
            const clampedViewport = clampViewportPosition(currentViewport, dimensions);
            return isSameViewport(clampedViewport, currentViewport) ? currentViewport : clampedViewport;
        });
    }, [dimensions, setViewport]);

    useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) {
            prevViewportRef.current = viewport;
            return;
        }

        const previousViewport = prevViewportRef.current;
        const scaleChanged = previousViewport.scale !== viewport.scale;
        const positionUnchanged = previousViewport.x === viewport.x && previousViewport.y === viewport.y;

        if (scaleChanged && positionUnchanged) {
            const centeredViewport = computeZoomedViewport(
                previousViewport,
                viewport.scale,
                { x: dimensions.width / 2, y: dimensions.height / 2 },
                dimensions,
            );

            if (!isSameViewport(centeredViewport, viewport)) {
                setViewport(centeredViewport);
                return;
            }
        }

        prevViewportRef.current = viewport;
    }, [dimensions, setViewport, viewport]);

    const startPan = (stage: KonvaStageType, point: Point) => {
        setIsPanning(true);
        setPanStart({
            pointer: point,
            viewport,
        });
        didPanRef.current = false;
        stage.container().style.cursor = "grabbing";
    };

    const stopPan = () => {
        setIsPanning(false);
        setPanStart(null);
        if (containerRef.current) {
            containerRef.current.style.cursor = isSpacePressed ? "grab" : "crosshair";
        }
    };

    const handleMouseDown = (evt: KonvaEventObject<NativeMouseEvent>) => {
        const stage = evt.target.getStage();
        if (!stage) {
            return;
        }

        const pointer = stage.getPointerPosition();
        if (!pointer) {
            return;
        }

        const isMiddleMouse = evt.evt.button === 1;
        const isSpacePan = evt.evt.button === 0 && isSpacePressed;
        if (isMiddleMouse || isSpacePan) {
            evt.evt.preventDefault();
            if (currentPolygon && selectedTool === "polygon") {
                setHoverPos(null);
                setIsSnaping(false);
            }
            startPan(stage, pointer);
            return;
        }

        if (selectedTool === "") return;
        setIsDrawing(true);
        const pos = screenToWorld(pointer, viewport);

        if (selectedTool === "line") {
            setCurrentLine({
                points: [],
                start: { x: pos.x, y: pos.y },
                end: { x: pos.x, y: pos.y },
                stroke: strokeColor,
                strokeWidth,
                zIndex,
                shapeType: "line"
            });
        } else if (selectedTool === "freehand") {
            setCurrentLine({
                points: [pos.x, pos.y],
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                zIndex: zIndex,
                shapeType: "freehand"
            });
        } else if (selectedTool === "rectangle") {
            setCurrentLine({
                x: pos.x,
                y: pos.y,
                width: 0,
                height: 0,
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                zIndex: zIndex,
                shapeType: "rectangle"
            })
        } else if (selectedTool === "ellipse") {
            setCurrentLine({
                x: pos.x,
                y: pos.y,
                radiusX: 0,
                radiusY: 0,
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                zIndex: zIndex,
                shapeType: "ellipse"
            })
        }
    };

    const handleMouseMove = (evt: KonvaEventObject<NativeMouseEvent>) => {
        const stage = evt.target.getStage();
        if (!stage) {
            return;
        }

        if (isPanning && panStart) {
            const pointer = stage.getPointerPosition();
            if (!pointer) {
                return;
            }

            const nextViewport = clampViewportPosition({
                ...panStart.viewport,
                x: panStart.viewport.x + (pointer.x - panStart.pointer.x),
                y: panStart.viewport.y + (pointer.y - panStart.pointer.y),
            }, dimensions);

            if (nextViewport.x !== viewport.x || nextViewport.y !== viewport.y) {
                didPanRef.current = true;
                setViewport(nextViewport);
            }
            return;
        }

        if (!isDrawing || !currentLine) return;
        const pos = getPointerWorldPosition(stage, viewport);
        if (!pos) {
            return;
        }

        if (currentLine.shapeType === "line") {
            const newLine = {
                ...currentLine,
                end: { x: pos.x, y: pos.y }
            };
            setCurrentLine(newLine);
        } else if (currentLine.shapeType === "freehand") {
            const newLine = {
                ...currentLine,
                points: [...(currentLine.points || []), pos.x, pos.y],
            };
            setCurrentLine(newLine);
        } else if (currentLine.shapeType === "rectangle") {
            const newRect = {
                ...currentLine,
                width: pos.x - currentLine.x!,
                height: pos.y - currentLine.y!
            };
            setCurrentLine(newRect);
        } else if (currentLine.shapeType === "ellipse") {
            const dx = pos.x - currentLine.x!;
            const dy = pos.y - currentLine.y!;
            const radius = {
                radiusX: Math.abs(dx),
                radiusY: Math.abs(dy)
            }
            const newEllipse = {
                ...currentLine,
                radiusX: radius.radiusX,
                radiusY: radius.radiusY
            }
            setCurrentLine(newEllipse);
        }
    };

    const handleMouseUp = () => {
        if (isPanning) {
            stopPan();
            return;
        }

        if (!isDrawing || !currentLine) return;
        setIsDrawing(false);

        let shouldAdd = false;

        if (currentLine.shapeType === "line") {
            const { start, end } = currentLine;
            const dist = Math.sqrt(Math.pow(end!.x - start!.x, 2) + Math.pow(end!.y - start!.y, 2));
            if (dist >= 5) {
                addHistory({
                    ...currentLine,
                    points: [start!.x, start!.y, end!.x, end!.y]
                });
                setZIndex(zIndex + 1);
            }
        } else if (currentLine.shapeType === "freehand") {
            const pts = currentLine.points;
            if (pts && pts.length >= 4) {
                const dx = pts[pts.length - 2] - pts[0];
                const dy = pts[pts.length - 1] - pts[1];
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist >= 5) {
                    shouldAdd = true;
                }
            }
        } else if (currentLine.shapeType === "rectangle") {
            const width = currentLine.width!;
            const height = currentLine.height!;
            if (Math.abs(width) >= 5 && Math.abs(height) >= 5) {
                shouldAdd = true;
            }
        } else if (currentLine.shapeType === "ellipse") {
            const radiusX = currentLine.radiusX!;
            const radiusY = currentLine.radiusY!;
            if (radiusX >= 5 && radiusY >= 5) {
                shouldAdd = true;
            }
        }
        if (shouldAdd) {
            addHistory({ ...currentLine, zIndex });
            setZIndex(zIndex + 1);
        }
        setCurrentLine(null);
    };

    const handleStageClick = (evt: KonvaEventObject<MouseEvent>) => {
        if (didPanRef.current) {
            didPanRef.current = false;
            return;
        }

        if (selectedTool !== "polygon" || isPanning) return;
        const stage = evt.target.getStage();
        if (!stage) {
            return;
        }

        const pos = getPointerWorldPosition(stage, viewport);
        if (!pos) {
            return;
        }

        if (!currentPolygon) {
            setCurrentPolygon({
                points: [pos.x, pos.y],
                isDrawing: true
            })
        } else {
            const points = currentPolygon.points;
            const dx = pos.x - points[0];
            const dy = pos.y - points[1];
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 10 && points.length >= 6) {
                addHistory({
                    points: [...points, points[0], points[1]],
                    stroke: strokeColor,
                    strokeWidth: strokeWidth,
                    zIndex: zIndex,
                    shapeType: "polygon"
                });
                setZIndex(zIndex + 1);
                setCurrentPolygon(null);
                setIsSnaping(false);
                setHoverPos(null);
            } else {
                const newPolygon = {
                    ...currentPolygon,
                    points: [...points, pos.x, pos.y]
                }
                setCurrentPolygon(newPolygon);
            }
        }
    }

    const handleStageMouseMove = (evt: KonvaEventObject<NativeMouseEvent>) => {
        if (isPanning) {
            return;
        }

        if (selectedTool === "polygon" && currentPolygon && currentPolygon.isDrawing) {
            const stage = evt.target.getStage();
            if (!stage) {
                return;
            }

            const pos = getPointerWorldPosition(stage, viewport);
            if (!pos) {
                return;
            }

            const points = currentPolygon.points;
            if (points.length >= 2) {
                const dx = pos.x - points[0];
                const dy = pos.y - points[1];
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 10) {
                    setIsSnaping(true);
                    setHoverPos({ x: points[0], y: points[1] });
                } else {
                    setIsSnaping(false);
                    setHoverPos(pos);
                }
            } else {
                setIsSnaping(false);
                setHoverPos(pos);
            }
        }
    }

    const handleWheel = (evt: KonvaEventObject<NativeWheelEvent>) => {
        evt.evt.preventDefault();
        if (dimensions.width === 0 || dimensions.height === 0 || isDrawing || isPanning) {
            return;
        }

        const stage = evt.target.getStage();
        if (!stage) {
            return;
        }

        const pointer = stage.getPointerPosition();
        if (!pointer) {
            return;
        }

        const direction = evt.evt.deltaY < 0 ? 1 : -1;
        const nextScale = clampScale(viewport.scale + direction * ZOOM_STEP);
        if (nextScale === viewport.scale) {
            return;
        }

        setViewport(computeZoomedViewport(viewport, nextScale, pointer, dimensions));
    };

    const handleMouseLeave = () => {
        if (isPanning) {
            stopPan();
        }
    };

    const cursorClassName = isPanning
        ? "is-panning"
        : isSpacePressed
            ? "is-pan-ready"
            : "is-drawing";
    const gridLines = buildGridLines(viewport, dimensions);
    const gridStrokeWidth = Math.max(0.6, 1 / viewport.scale);
    const sortedLayers = [...layers].sort((left, right) => left.zIndex - right.zIndex);

    const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
        if (!event.dataTransfer.types.includes("Files")) {
            return;
        }

        dragDepthRef.current += 1;
        setIsDragActive(true);
        setDropError(null);
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        if (!event.dataTransfer.types.includes("Files")) {
            return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        setIsDragActive(true);
    };

    const handleDragLeave = () => {
        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
        if (dragDepthRef.current === 0) {
            setIsDragActive(false);
        }
    };

    const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        dragDepthRef.current = 0;
        setIsDragActive(false);
        setDropError(null);

        const imageFile = Array.from(event.dataTransfer.files).find((file) => file.type.startsWith("image/"));
        if (!imageFile) {
            setDropError("이미지 파일만 캔버스에 넣을 수 있어요.");
            return;
        }

        if (imageFile.size > MAX_IMAGE_DROP_SIZE) {
            setDropError("이미지가 너무 커서 넣을 수 없어요. 12MB 이하 파일을 사용해 주세요.");
            return;
        }

        try {
            const imageData = await getDroppedImageData(imageFile);
            const containerRect = containerRef.current?.getBoundingClientRect();
            if (!containerRect) {
                return;
            }

            const pointer = {
                x: event.clientX - containerRect.left,
                y: event.clientY - containerRect.top,
            };
            const worldPoint = screenToWorld(pointer, viewport);
            const fittedImage = fitDroppedImage(imageData.width, imageData.height, viewport, dimensions);
            const minZIndex = layers.reduce((lowest, layer) => Math.min(lowest, layer.zIndex), 0);

            addHistory({
                shapeType: "image",
                imageSrc: imageData.src,
                imageName: imageFile.name,
                x: worldPoint.x - fittedImage.width / 2,
                y: worldPoint.y - fittedImage.height / 2,
                width: fittedImage.width,
                height: fittedImage.height,
                stroke: "transparent",
                strokeWidth: 0,
                zIndex: minZIndex - 1,
            });
        } catch {
            setDropError("이미지를 불러오지 못했어요. 다른 파일로 다시 시도해 주세요.");
        }
    };

    return (
        <div
            className={`konva_stage ${cursorClassName} ${isDragActive ? "is-drop-target" : ""}`}
            ref={containerRef}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <Stage
                width={dimensions.width}
                height={dimensions.height}
                x={viewport.x}
                y={viewport.y}
                scaleX={viewport.scale}
                scaleY={viewport.scale}
                onMouseDown={handleMouseDown}
                onMouseMove={(evt) => {
                    handleMouseMove(evt);
                    handleStageMouseMove(evt);
                }}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onClick={handleStageClick}
                onWheel={handleWheel}
            >
                <Layer listening={false}>
                    {gridLines.map((line) => (
                        <Line
                            key={line.key}
                            points={line.points}
                            stroke={line.isMajor ? "rgba(14, 14, 17, 0.12)" : "rgba(14, 14, 17, 0.06)"}
                            strokeWidth={line.isMajor ? gridStrokeWidth * 1.1 : gridStrokeWidth}
                        />
                    ))}
                </Layer>
                <Layer>
                    {sortedLayers.map((history, index) => {
                        if (history.shapeType === "image") {
                            return <CanvasImageShape key={`image-${index}-${history.zIndex}`} history={history} />;
                        } else if (history.shapeType === "line" || history.shapeType === "freehand") {
                            return (
                                <Line
                                    key={index}
                                    points={history.points}
                                    stroke={history.stroke}
                                    strokeWidth={history.strokeWidth}
                                    zIndex={history.zIndex}
                                    lineCap="round"
                                    lineJoin="round"
                                />
                            )
                        } else if (history.shapeType === "rectangle") {
                            return (
                                <Rect
                                    key={index}
                                    x={history.x}
                                    y={history.y}
                                    width={history.width}
                                    height={history.height}
                                    stroke={history.stroke}
                                    strokeWidth={history.strokeWidth}
                                    zIndex={history.zIndex}
                                />
                            )
                        } else if (history.shapeType === "ellipse") {
                            return (
                                <Ellipse
                                    key={index}
                                    x={history.x}
                                    y={history.y}
                                    radiusX={history.radiusX!}
                                    radiusY={history.radiusY!}
                                    stroke={history.stroke}
                                    strokeWidth={history.strokeWidth}
                                    zIndex={history.zIndex}
                                />
                            )
                        } else if (history.shapeType === "polygon") {
                            return (
                                <Line
                                    key={index}
                                    points={history.points}
                                    stroke={history.stroke}
                                    strokeWidth={history.strokeWidth}
                                    zIndex={history.zIndex}
                                    closed={true}
                                    lineCap="round"
                                    lineJoin="round"
                                />
                            )
                        }

                        return null;
                    })}
                    {currentLine && (currentLine.shapeType === "line" || currentLine.shapeType === "freehand") && (
                        <Line
                            points={
                                currentLine.shapeType === "line" ? [currentLine.start!.x, currentLine.start!.y, currentLine.end!.x, currentLine.end!.y] : currentLine.points
                            }
                            stroke={currentLine.stroke}
                            strokeWidth={currentLine.strokeWidth}
                            tension={0.5}
                            lineCap="round"
                            lineJoin="round"
                            zIndex={zIndex}
                        />
                    )}
                    {currentLine && currentLine.shapeType === "rectangle" && (
                        <Rect
                            x={currentLine.x}
                            y={currentLine.y}
                            width={currentLine.width}
                            height={currentLine.height}
                            stroke={currentLine.stroke}
                            strokeWidth={currentLine.strokeWidth}
                            zIndex={zIndex}
                        />
                    )}
                    {currentLine && currentLine.shapeType === "ellipse" && (
                        <Ellipse
                            x={currentLine.x}
                            y={currentLine.y}
                            radiusX={currentLine.radiusX!}
                            radiusY={currentLine.radiusY!}
                            stroke={currentLine.stroke}
                            strokeWidth={currentLine.strokeWidth}
                            zIndex={zIndex}
                        />
                    )}
                    {
                        selectedTool === "polygon" && currentPolygon && (
                            <>
                                <Line
                                    points={hoverPos ? [...currentPolygon.points, hoverPos.x, hoverPos.y] : currentPolygon.points}
                                    stroke={strokeColor}
                                    strokeWidth={1}
                                    closed={isSnaping}
                                    zIndex={zIndex}
                                    lineCap="round"
                                    lineJoin="round"
                                />
                                {
                                    currentPolygon.points.length >= 2 &&
                                    currentPolygon.points.reduce((acc: JSX.Element[], val, idx, arr) => {
                                        if (idx % 2 === 0 && arr[idx + 1] !== undefined) {
                                            acc.push(
                                                <Circle
                                                    key={idx}
                                                    x={val}
                                                    y={arr[idx + 1]}
                                                    radius={6}
                                                    fill={strokeColor}
                                                    strokeWidth={2}
                                                />
                                            );
                                        }
                                        return acc;

                                    }, [])
                                }
                            </>
                        )
                    }
                </Layer>
            </Stage>
            <div className="viewport_hud">
                <span>{Math.round(Math.min(MAX_SCALE, Math.max(MIN_SCALE, viewport.scale)) * 100)}%</span>
                <span className="viewport_hint">Space + Drag to pan</span>
            </div>
            {(isDragActive || dropError) && (
                <div className={`drop_overlay ${dropError ? "has-error" : ""}`}>
                    <strong>{dropError ? "이미지를 넣지 못했어요" : "이미지를 여기에 드롭하세요"}</strong>
                    <span>{dropError ?? "사진이나 그림 파일을 떨어뜨리면 캔버스 아래 레이어로 배치됩니다."}</span>
                </div>
            )}
        </div>
    );
};

export default KonvaStage;
