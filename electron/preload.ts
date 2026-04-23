import { contextBridge, ipcRenderer } from "electron";
import type { DesktopApi } from "../src/types/desktop.js";

const desktopApi: DesktopApi = {
    savePng: (request) => ipcRenderer.invoke("app:save-png", request),
};

contextBridge.exposeInMainWorld("desktop", desktopApi);
