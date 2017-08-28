import path from 'path';
import express, { Request, Response, NextFunction } from 'express';

const staticAssetsPath = path.resolve(`${__dirname}/../client`);
const indexPath = path.resolve(`${staticAssetsPath}/index.html`);

export function forwardToGzippedScripts(req: Request, res: Response, next: NextFunction): void {
    if (req.url.endsWith('.js')) {
        req.url += '.gz';
        res.set('Content-Encoding', 'gzip');
    }

    next();
}

export const serveStaticAssets = express.static(staticAssetsPath);
export const routeEverythingToIndex = express.Router().get('/*', (req: Request, res: Response) => {
    res.sendFile(indexPath);
});
