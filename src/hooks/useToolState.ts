import { useState } from "react";
import type { Tool } from "../Types";

export const useToolState = () => {
    const [selectedTool, setSelectedTool] = useState<Tool>("line");
    const [strokeWidth, setStrokeWidth] = useState<number>(5);
    const [strokeColor, setStrokeColor] = useState<string>("#000000");
    
    return { 
        selectedTool, 
        setSelectedTool, 
        strokeWidth, 
        setStrokeWidth, 
        strokeColor, 
        setStrokeColor 
    };
};
