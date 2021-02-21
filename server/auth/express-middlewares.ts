import { RequestHandler, Request, Response, NextFunction } from 'express';
import expressJwt from 'express-jwt';
import { compose } from 'compose-middleware';
import { getUserFromJwtToken, IJwtToken } from './index';

/**
 * Requires a JWT token to be present in the request (Authorization: Bearer <token>).
 * Puts the token payload in req.user.
 * Doesn't allow anonymous users.
 */
export function requireJwtToken(): RequestHandler {
    return expressJwt({ secret: process.env.SERVER_SECRET });
}
