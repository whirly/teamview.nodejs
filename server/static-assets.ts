import path from 'path';
import express, { Request, Response, NextFunction } from 'express';

const staticAssetsPath = path.resolve(`${__dirname}/../client`);

export function forwardToGzippedScripts(req: Request, res: Response, next: NextFunction): void {
    if (req.url.endsWith('.js')) {
        req.url += '.gz';
        res.set('Content-Encoding', 'gzip');
    }

    next();
}

export const serveStaticAssets = express.static(staticAssetsPath);
