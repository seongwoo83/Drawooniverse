import { createContext } from "react";
import type { DrawingContextType } from "../Types";

export const DrawingContext = createContext<DrawingContextType | undefined>(undefined); 