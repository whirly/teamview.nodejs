import { deepStrictEqual as assert } from 'assert';
import * as express from 'express';
import * as compose from 'graphql-compose';
import { Maybe, MaybeAsync, Mutable } from '../rxjs';

export interface Context {
    /**
     * Express request.
     */
    req: express.Request;

    /**
     * Request language declared by the app.
     */
    language: string;
}

export type ResolversMap = { [resolverName: string]: Resolver };

export type ComposeHook<TDoc = unknown> = (object: TDoc, params: ResolveParams) => MaybeAsync<Maybe<TDoc>>;

export type Checker = (params: ResolveParams) => MaybeAsync<boolean>;

export type DocumentChecker<TDoc = unknown> = (params: ResolveParams, object: TDoc) => MaybeAsync<boolean>;

//=> graphql-compose provides its own middlewares system, but because of
//   https://github.com/graphql-compose/graphql-compose/issues/170
//   we'll have a slightly different syntax.
export type ResolverMiddleware<TSource = unknown, TArgs = compose.DirectiveArgs> = (
    resolve: (params: ResolveParams<TSource, TArgs>) => any,
    params: ResolveParams<TSource, TArgs>,
    resolver: Resolver<TSource, TArgs>) => any;

//=> Derivate some graphql-compose types to "curry" the TContext generic argument
export type Resolver<TSource = unknown, TArgs = compose.DirectiveArgs, TReturn = unknown> =
    compose.Resolver<TSource, Context, TArgs, TReturn>;

export type ResolveParams<TSource = unknown, TArgs = compose.DirectiveArgs> =
    compose.ResolverResolveParams<TSource, Context, TArgs>;

export type ObjectTypeComposerFieldConfigMapDefinition<TSource = unknown> =
    compose.ObjectTypeComposerFieldConfigMapDefinition<TSource, Context>;

export type ResolverFilterArg<TSource = unknown, TArgs = compose.DirectiveArgs> =
    compose.ResolverFilterArgConfigDefinition<TSource, Context, TArgs>;

/**
 * Given a map of resolvers, prefixes the queries and mutations names (the map keys) and returns a new map
 * with the new names.
 */
export function prefixQueries(
    prefix: string,
    resolvers: ObjectTypeComposerFieldConfigMapDefinition): ObjectTypeComposerFieldConfigMapDefinition {

    const newQueriesMap: Mutable<ObjectTypeComposerFieldConfigMapDefinition> = {};

    return Object.entries(resolvers).reduce((map, [queryName, resolver]) => {
        map[prefix + queryName[0].toUpperCase() + queryName.substring(1)] = resolver;
        return map;
    }, newQueriesMap);
}

/**
 * Wraps a resolver resolve function to add more logic around it.
 * The middleware is responsible of calling the parent resolve function passed to it.
 * Doing that, it can control if it executes before or after (or both) the parent resolve function.
 *
 * /!\ Middlewares passed in the array param execute in left-to-right (fifo) order, but do not forget that
 *     the actual code of the middleware still controls wether it executes before or after the parent resolve().
 *
 * Please see Resolver#withMiddlewares() method from graphql-compose for more documentation.
 * It works the same, but instead of passing resolve params as positional arguments to the middleware, it uses a
 * well-known ResolveParams object, so we can access vendor props like .projection or .beforeRecordMutate.
 * @see {@link https://github.com/graphql-compose/graphql-compose/issues/170}
 *
 * Example:
 *     const queries = {
 *         findSomething: withMiddwares(tc.getResolver('...'), [[someMiddleware(), otherMiddleware()])
 *     }
 *
 *     function someMiddleware(): ResolverMiddleware {
 *         return function someMiddlewareMiddleware(resolve, params) {
 *             // Here, our middleware executes code before and after the parent resolver.
 *             someLogic();
 *             const resolved = resolve(params);
 *             return moreLogic(resolved);
 *         }
 *     }
 *
 * @param resolver The resolver to wrap
 * @param middlewares The middlewares to apply
 */
export function withMiddlewares(resolver: Resolver, middlewares: ResolverMiddleware[]): Resolver {
    return middlewares.reduceRight((parent, mw) => {
        const name = mw.name ?? mw.constructor?.name ?? 'middleware';

        const newResolver = parent.clone({ name: `${name}::${parent.name}`, parent });

        const resolve = parent.getResolve();

        newResolver.setResolve(params => mw(resolve, params, parent));

        return newResolver;
    }, resolver);
}

/**
 * Works like {@link withMiddlewares} but applies the given middlewares to many resolvers.
 * See the first funnction for more info.
 * Example:
 *     const queries = {
 *         ...allWithMiddlewares([someMiddleware(), otherMiddleware()], {
 *             findSomething: tc.getResolver('...'),
 *             findAnotherThing: tc.getResolver('...'),
 *         })
 *     }
 *
 * @param middlewares The middlewares to apply
 * @param resolvers The resolvers to wrap
 */
export function allWithMiddlewares<T extends ResolversMap>(middlewares: ResolverMiddleware[], resolvers: T): T {
    const newResolvers: ResolversMap = {};

    Object.keys(resolvers).forEach(key => {
        newResolvers[key] = withMiddlewares(resolvers[key], middlewares);
    });

    return newResolvers as T;
}

/**
 * Combines two graphql-compose hooks by returning a function that executes both.
 */
export function combineComposeHook<T>(prevHook: ComposeHook<T> | undefined, nextHook: ComposeHook<T>): ComposeHook<T> {
    return async (doc, params) => {
        const updatedDoc = prevHook ? await prevHook(doc, params) : doc;
        if (!updatedDoc) return;

        return nextHook(updatedDoc, params);
    };
}

/**
 * Augments the global context object with a middware's context object put in a given property.
 */
export function setMiddlewareContext<TExtension>(context: Context, key: symbol, extension: TExtension): void {
    (context as any)[key] = extension;
}

/**
 * Checks if a middleware's context object exists in the global context object.
 */
export function hasMiddlewareContext(context: Context, key: symbol): boolean {
    return context.hasOwnProperty(key);
}

/**
 * Retrieves a middleware's context from the global context object.
 */
export function getMiddlewareContext<TExtension>(context: Context, key: symbol): TExtension {
    if (!hasMiddlewareContext(context, key)) {
        throw new Error(`Middleware context ${String(key)} was required, but is not set. Is the middleware missing?`);
    }

    return (context as any)[key];
}

/**
 * Find the most ancient resolver in a chain of resolvers, by descending the {@link Resolver.parent} chain.
 *
 * @param resolver The resolver to start from. It is returned if it has no parent.
 */
export function getRootResolver(resolver: Resolver): Resolver {
    while (resolver.parent) {
        resolver = resolver.parent;
    }

    return resolver;
}

/**
 * Eases the creation of relations without overriding some resolvers' arguments (ie. us by letting you use
 * tc.addRelation('wheels', {
 *    projection: { _id: 1 },
 *    resolver: prepareQuery<CarDocument>(
 *        wheelsTypeComposer.getResolver('findMany'),
 *        ({ args, source }) => ({ carId: source._id }))
 * });
 *
 * @param resolver
 * @param queryFactory
 */
export function prepareQuery<TSource, TContext = Context, TArgs = compose.DirectiveArgs>(
    resolver: compose.Resolver<any, TContext, TArgs>,
    queryFactory: (params: ResolveParams<TSource, TArgs>) => object): compose.Resolver<TSource, TContext, TArgs> {

    return resolver.wrapResolve(next => params => {
        params.rawQuery = queryFactory(params as unknown as ResolveParams<TSource, TArgs>);

        return next(params);
    });
}

/**
 * Combines multiple resolvers into one with OR logic.
 * The resulting resolvers returns as soon as a first checker returns true.
 *
 * @param checkers
 */
export function or(...checkers: DocumentChecker[]): DocumentChecker {
    return async (params, object) => {
        for (const checker of checkers) {
            if (await checker(params, object)) return true;
        }

        return false;
    };
}

/**
 * Combines multiple resolvers into one with AND logic.
 *
 * @param checkers
 */
export function and(...checkers: DocumentChecker[]): DocumentChecker {
    return async (params, object) => {
        for (const checker of checkers) {
            if (!await checker(params, object)) return false;
        }

        return true;
    };
}

export function makeConnectionNodeNullable(tc: compose.ObjectTypeComposer): void {
    const edgesTc = tc.getResolver('connection').getOTC().getFieldOTC('edges');

    assert(edgesTc.isFieldNonNull('node'), 'graphql-compose-connection changed its typings!');

    edgesTc.makeFieldNullable('node');
}

export function makeFieldNonNullPlural(
    tc: compose.ObjectTypeComposer | compose.InputTypeComposer,
    fieldName: string): void {

    tc.extendField(fieldName, {
        type: tc.getFieldTC(fieldName).getTypeNonNull().getTypePlural()
    });
}

export function makeFieldNonNullPluralNonNull(
    tc: compose.ObjectTypeComposer | compose.InputTypeComposer,
    fieldName: string): void {

    tc.extendField(fieldName, {
        type: tc.getFieldTC(fieldName).getTypeNonNull().getTypePlural().getTypeNonNull()
    });
}

export function getFieldObjectTypeComposer<TSource>(
    tc: compose.ObjectTypeComposer,
    fieldName: string): compose.ObjectTypeComposer<TSource, Context> {

    return tc.getFieldOTC(fieldName);
}
