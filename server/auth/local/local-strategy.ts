import { Strategy as LocalStrategy } from 'passport-local';
import { IMongooseUser } from '../../models';
import { getUserFromEmailAndPassword } from '../index';
import { AuthenticationError } from '../auth-errors';

type DoneFunc = (err?: any, authed?: false|IMongooseUser) => void;

export const LOCAL_STRATEGY = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email: string, password: string, done: DoneFunc) => {
    try {
        const user = await getUserFromEmailAndPassword(email, password);

        return done(null, user);
    } catch (err) {
        return err instanceof AuthenticationError ? done(null, false) : done(err);
    }
});
