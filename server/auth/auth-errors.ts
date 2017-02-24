// tslint:disable:max-classes-per-file

export class AuthenticationError extends Error {
    public name = 'AuthenticationError';
}

export class NoSuchUserError extends AuthenticationError {
    public name = 'NoSuchUserError';
}

export class InvalidPasswordError extends AuthenticationError {
    public name = 'InvalidPasswordError';
}
