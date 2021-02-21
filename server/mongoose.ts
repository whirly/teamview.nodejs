import mongoose, { Collection } from 'mongoose';
import logger from './logger';

// tslint:disable:only-arrow-functions

//=> Setup logging of queries
mongoose.set('debug', function(this: Collection, collection: string, method: string, ...methodArgs: any[]) {
    // Basically extracted from https://goo.gl/OYCxAV (otherwise, Mongoose writes directly to stderr).
    const args: string[] = [];
    for (let j = methodArgs.length - 1; j >= 0; --j) {
        if (this.$format(methodArgs[j]) || args.length) {
            args.unshift(this.$format(methodArgs[j]));
        }
    }

    logger.debug(`mongo: ${collection}.${method}(${args.join(', ')})`);
});

export function connectDatabase(mongoUrl: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        mongoose.connect(mongoUrl, (error) => {
            error
                ? reject(new Error(`Could not connect to the MongoDB instance! ${error.message}`))
                : resolve();
        });
    });
}

export function disconnectFromDatabase(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        mongoose.disconnect(error => error ? reject() : resolve());
    });
}
