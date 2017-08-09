// tslint:disable:max-classes-per-file

export class AuthenticationError extends Error {
    constructor(m: string) {
        super(m);
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }

}

export class NoAnonymousAccessError extends AuthenticationError {
    constructor(m = 'Anonymous users aren\'t allowed to perform this operation') {
        super(m);
        Object.setPrototypeOf(this, NoAnonymousAccessError.prototype);
    }
}

export class NoSuchUserError extends AuthenticationError {
    constructor(m: string) {
        super(m);
        Object.setPrototypeOf(this, NoSuchUserError.prototype);
    }

}

export class InvalidPasswordError extends AuthenticationError {
    constructor(m: string) {
        super(m);
        Object.setPrototypeOf(this, InvalidPasswordError.prototype);
    }
}

export class UnmetPermissionsError extends AuthenticationError {
    constructor(m = 'Access denied, user doesn\'t have needed permissions to perform this operation.') {
        super(m);
        Object.setPrototypeOf(this, UnmetPermissionsError.prototype);
    }
}
