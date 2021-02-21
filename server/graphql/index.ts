import {formatError, GraphQLError, GraphQLFormattedError} from 'graphql';
import { schemaComposer } from 'graphql-compose';
import { ApolloError, ApolloServer, SyntaxError, ValidationError } from 'apollo-server-express';
import {
    InternalError,
    StandardError,
    SyntaxError as StandardSyntaxError,
    ValidationError as StandardValidationError
} from './errors';
import { printError } from 'graphql';
import logger from '../logger';
import * as account from './graphql-account';
import * as user from './graphql-user';
import * as userRole from './graphql-user-role';
import * as team from './graphql-team';
import * as player from './graphql-player';
import * as performance from './graphql-performance';
import * as fixture from './graphql-fixture';
import * as util from "util";
import {Application} from "express";

schemaComposer.Query.addFields({
    ...account.QUERIES,
    ...user.QUERIES, ...userRole.QUERIES,
    ...team.QUERIES, ...player.QUERIES,
    ...performance.QUERIES, ...fixture.QUERIES
});

schemaComposer.Mutation.addFields({
    ...account.MUTATIONS,
    ...user.MUTATIONS, ...userRole.MUTATIONS,
    ...team.MUTATIONS, ...player.MUTATIONS,
    ...performance.MUTATIONS, ...fixture.MUTATIONS
});

const schema = schemaComposer.buildSchema();

const server = new ApolloServer({
    schema,
    introspection: true,
    playground: {
        settings: {
            'editor.theme': 'light'
        }
    },
    debug: process.env.NODE_ENV === 'development',
    tracing: process.env.NODE_ENV === 'development',
    plugins: [
        {
            requestDidStart(requestContext) {
                logger.debug(`graphql:`, {
                    query: requestContext.request.query,
                    operationName: requestContext.request.operationName,
                    variables: requestContext.request.variables
                });
            }
        }
    ],
    formatError(error: GraphQLError): GraphQLFormattedError {
        //=> Generate a formatted error and copy its immutable properties in a mutable object
        const gqlFormattedError = formatError(error);
        const formattedError = {
            ...gqlFormattedError,
            message: gqlFormattedError.message,
            location: gqlFormattedError.locations,
            path: gqlFormattedError.path,
            extensions: gqlFormattedError.extensions ?? {}
        };

        //=> Log the original error to the console for debug
        const errorToInspect = error instanceof ApolloError ? error : error.originalError;
        const originalErrorStr = util.inspect(errorToInspect, { colors: true, depth: 2 });

        logger.error(`graphql: ${printError(error)}\n\n${originalErrorStr}`);

        //=> Format based on the error type
        if (error instanceof SyntaxError) {
            //=> Apollo GraphQL syntax error, showable, but transform to Standard Error
            const graphQLError = new StandardSyntaxError({ apolloError: error.originalError as SyntaxError });

            formattedError.message = graphQLError.message;
            formattedError.extensions.code = graphQLError.code;
        } else if (error instanceof ValidationError) {
            //=> Apollo GraphQL validation error, showable, but transform to Standard Error
            const graphQLError = new StandardValidationError({ apolloError: error.originalError as ValidationError});

            formattedError.message = graphQLError.message;
            formattedError.extensions.code = graphQLError.code;
        } else if (error.originalError instanceof StandardError) {
            //=> Standard Errors have exploitable code and context data
            formattedError.extensions.code = error.originalError.code;
            formattedError.extensions.context = error.originalError.context;
        } else {
            //=> We don't know the error type, send back an opaque "internal server error" so we don't leak any
            //   potentially sensible technical data.
            const internalServerError = new InternalError();

            formattedError.message = process.env.NODE_ENV == 'development'
                ? `${error.message} [Unknown error type: this message will be redacted in production mode]`
                : internalServerError.message;

            formattedError.extensions.code = internalServerError.code;
        }

        //=> In production, remove all details about the original error as that could leak technical data
        if (process.env.NODE_ENV != 'development') {
            delete formattedError.extensions.exception;
        }

        return formattedError;
    }
});

export function attachGraphQlServerOnApp(app: Application, path: string) {
    server.applyMiddleware({ app, path });
}
