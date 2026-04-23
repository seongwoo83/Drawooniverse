export type SavePngRequest = {
    defaultFileName: string;
    dataUrl: string;
};

export type SavePngResult = {
    canceled: boolean;
    path?: string;
};

export interface DesktopApi {
    savePng: (request: SavePngRequest) => Promise<SavePngResult>;
}
