import express from 'express';
import * as jwt from 'jsonwebtoken';
import * as pify from 'pify';
import { IMongooseUser, User } from '../models';
import { NoSuchUserError, InvalidPasswordError } from './auth-errors';
import localAuthenticationRouter from './local';

const router = express.Router();

router.use('/local', localAuthenticationRouter);

export default router;

export interface IJwtToken {
    _id: string;
    hsh: string;
}

export function forgeJwtTokenFor(user: IMongooseUser): string {
    return jwt.sign({
        _id: user._id,
        hsh: user.password // include hash so tokens are invalidated when changing password
    }, process.env.SERVER_SECRET, {
        expiresIn: '1 year'
    });
}

export async function getUserFromEmailAndPassword(email: string, password: string): Promise<IMongooseUser> {
    const user = await User.findOne({ email }).populate('role');
    if (!user) {
        throw new NoSuchUserError(`No user have registered with e-mail address ${email}`);
    }

    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
        throw new InvalidPasswordError(`Invalid password provided for user ${user.firstName} ${user.lastName}`);
    }

    return user;
}

export async function getUserFromJwtToken(token: IJwtToken|string): Promise<IMongooseUser> {
    if (typeof token == 'string') {
        token = await pify(jwt.verify)(token, process.env.SERVER_SECRET);
    }

    const payload = token as IJwtToken;

    const user = await User.findOne({ _id: payload._id, password: payload.hsh }).populate('role');

    if (!user) {
        // tslint:disable-next-line:max-line-length
        throw new NoSuchUserError('Could not find an user for this token, the account has been deleted or the password has been changed.');
    }

    return user;
}
