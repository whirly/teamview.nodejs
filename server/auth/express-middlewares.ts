import { RequestHandler, Request, Response, NextFunction } from 'express';
import expressJwt from 'express-jwt';
import { compose } from 'compose-middleware';
import { getUserFromJwtToken } from './index';

/**
 * Requires a JWT token to be present in the request (Authorization: Bearer <token>).
 * Puts the token payload in req.user.
 * Doesn't allow anonymous users.
 */
export function requireJwtToken(): RequestHandler {
    return expressJwt({ secret: process.env.SERVER_SECRET });
}

/**
 * If a JWT token is present in the request, puts its payload in req.user.
 * Allow anonymous users.
 */
export function attachJwtToken(): RequestHandler {
    return compose(
        requireJwtToken(),
        (err: any, req: Request, res: Response, next: NextFunction) => {
            if (err.name === 'UnauthorizedError') {
                next(); // We don't care about invalid token error here.
            } else {
                next(err);
            }
        }
    );
}

/**
 * If a JWT token is present in the request, loads the related IMongooseUser and puts it in req.user.
 * Allow anonymous users.
 */
export function attachUser(): RequestHandler {
    return compose(
        attachJwtToken(),
        async (req: Request, res: Response, next: NextFunction) => {
            if (req.user && req.user._id) {
                try {
                    req.user = await getUserFromJwtToken(req.user);
                } catch (err) {
                    next(err);
                }
            }

            next();
        }
    );
}
