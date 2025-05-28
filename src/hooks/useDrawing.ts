import { useContext } from "react";
import { DrawingContext } from "../context/DrawingContext";

export const useDrawing = () => {
    const context = useContext(DrawingContext);
    if (!context) {
        throw new Error("useDrawing must be used within a DrawingProvider");
    }
    return context;
} 