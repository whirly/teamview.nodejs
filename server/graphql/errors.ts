import { SyntaxError as ApolloSyntaxError, ValidationError as ApolloValidationError } from 'apollo-server-express';

export type StandardErrorContext = { [key: string]: any } | undefined;

export class StandardError<TContext extends StandardErrorContext = undefined> extends Error {
    public readonly code: string;

    public constructor(public readonly context?: TContext) {
        super();

        const prototypes = traversePrototypeChain(this.constructor.prototype);

        const names = prototypes.map(prototype => {
            const name = prototype.constructor.name;
            return name.endsWith('Error') ? name.slice(0, name.lastIndexOf('Error')) : name;
        });

        this.code = names.join('.');

        this.message = `Errors.${this.code}`;

        function traversePrototypeChain(prototype: object): object[] {
            const parentPrototype = Object.getPrototypeOf(prototype);

            return parentPrototype && parentPrototype != StandardError.prototype
                ? [...traversePrototypeChain(parentPrototype), prototype]
                : [prototype];
        }
    }
}

export class InternalError extends StandardError {
}

export abstract class GraphQLError<T = undefined> extends StandardError<T> {
}

export class SyntaxError extends GraphQLError<{ apolloError: ApolloSyntaxError }> {
}

export class ValidationError extends GraphQLError<{ apolloError: ApolloValidationError }> {
}
