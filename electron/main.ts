import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { SavePngRequest, SavePngResult } from "../src/types/desktop.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rendererDistPath = path.join(__dirname, "..", "dist", "index.html");
const preloadPath = path.join(__dirname, "preload.js");
const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);

const createWindow = async () => {
    const mainWindow = new BrowserWindow({
        width: 1440,
        height: 960,
        minWidth: 1024,
        minHeight: 720,
        autoHideMenuBar: true,
        webPreferences: {
            preload: preloadPath,
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (isDev) {
        await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL!);
        mainWindow.webContents.openDevTools({ mode: "detach" });
        return;
    }

    await mainWindow.loadFile(rendererDistPath);
};

const decodeDataUrl = (dataUrl: string) => {
    const prefix = "data:image/png;base64,";
    if (!dataUrl.startsWith(prefix)) {
        throw new Error("Only PNG data URLs are supported.");
    }

    return Buffer.from(dataUrl.slice(prefix.length), "base64");
};

ipcMain.handle("app:save-png", async (_event, request: SavePngRequest): Promise<SavePngResult> => {
    const { canceled, filePath } = await dialog.showSaveDialog({
        defaultPath: request.defaultFileName,
        filters: [{ name: "PNG Image", extensions: ["png"] }],
    });

    if (canceled || !filePath) {
        return { canceled: true };
    }

    await writeFile(filePath, decodeDataUrl(request.dataUrl));

    return {
        canceled: false,
        path: filePath,
    };
});

app.whenReady().then(async () => {
    await createWindow();

    app.on("activate", async () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            await createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
