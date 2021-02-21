export type Maybe<T> = T | null | undefined;

export type MaybeAsync<T> = T | Promise<T>;

export type MaybeThunk<T> = T | (() => T);

export type Type<T> = new (...args: any[]) => T;

/**
 * Make all props of an object writeable (ie. not having the "readonly" modifier).
 * Reverse of built-in Readonly<> type.
 *
 * @todo Replace with future Mutable type from utility-types: https://github.com/piotrwitek/utility-types/issues/27
 */
export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Checks that a given valus is not null or undefined.
 *
 * @throws AssertionError if the value is null or undefined.
 */
export function assertNotNull<T>(value: Maybe<T>): asserts value is T {
    if (value == undefined) {
        throw new Error('Value was expected to not be null here.');
    }
}

/**
 * Checks that a given value is a string.
 *
 * @throws AssertionError if the value is not a string.
 */
export function assertString(value: unknown): asserts value is string {
    if (typeof value !== 'string') {
        throw new Error('Expected value to be a string');
    }
}

/**
 * Checks that a given value is member of a given enum.
 *
 * @throws AssertionError if the value is not a valid member of the enum.
 */
export function assertInEnum<T>(value: unknown, enumType: T): asserts value is T[keyof T] {
    if (!Object.values(enumType).includes(value)) {
        throw new Error('Expected value to be an enum value');
    }
}

/**
 * Evaluates a value that may be a thunk (arity=0), or returns the value directly.
 */
export function evalThunk<T>(thunk: MaybeThunk<T>): T {
    return typeof thunk == 'function' ? (thunk as () => T)() : thunk;
}

/**
 * Executes a function, returns its result, otherwise returns undefined if that function throws.
 */
export function swallowException<T>(getter: () => T): T | undefined {
    try {
        return getter();
    } catch {
        return undefined;
    }
}

/**
 * Like the "throw" keyword, but as a function - useful to throw inside or as an expression.
 * It is named "ethrow" for "E(xpression)Throw".
 *
 * @param error The error to throw.
 *              Yes, usually error type is `any` in JS/TS but we'll stick to Error in our own codebase.
 */
export function ethrow(error: Error): never {
    throw error;
}

/**
 * Like the "throw" keyword, but as a function - useful to throw inside or as an expression.
 * @deprecated Use {@link ethrow} and construct the Error yourself.
 */
export function throwErrorLegacy(message: string, errorCtor = Error): never {
    throw new errorCtor(message);
}

/**
 * A function that throws an error telling that the given value was unexpected, useful to throw inside an expression.
 */
export function throwUnexpectedTypeError(thingType: Maybe<string>): never {
    throw new Error(`${thingType} is unsupported here.`);
}

/**
 * A function that throws a "This should never happen" error, useful to throw inside an expression.
 */
export function throwThisShouldNeverHappenError(): never {
    throw new Error('This should never happen.');
}

export function filterOutNullArrayEntries<T>(array: Maybe<ReadonlyArray<Maybe<T>>>): T[] {
    if (!array) return [];

    return array.filter((entry): entry is T => entry != void 0);
}

export function normalizeToArray<T>(arrayOrSingle: T | T[]): T[] {
    return Array.isArray(arrayOrSingle) ? arrayOrSingle : [arrayOrSingle];
}

export function getStacktrace(): string[] {
    // .slice skips "Error: msg" line and this call on the stack
    return new Error().stack!.split('\n').slice(2).map(line => line.trim());
}

export function equalIds(firstId: unknown, secondId: unknown): boolean {
    if (!firstId || !secondId) return false;

    const firstIdValue = typeof firstId == 'object' ? firstId!.toString() : firstId;
    const secondIdValue = typeof secondId == 'object' ? secondId!.toString() : secondId;

    return firstIdValue == secondIdValue;
}

export function arrayContainsId(arrayOfIds: unknown[], id: unknown): boolean {
    return !!arrayOfIds.find(arrayId => equalIds(arrayId, id));
}

export function arrayPairwise<T, TLastValue = undefined>(
    array: readonly T[],
    defaultLastValue?: TLastValue): Array<[T, T | TLastValue]> {

    return array.reduce((result, value, index) => {
        const pair = index <= array.length - 2
            ? array.slice(index, index + 2) as [T, T]
            : [array[index], defaultLastValue] as [T, TLastValue];

        index % 2 === 0 && result.push(pair);
        return result;
    }, [] as Array<[T, T | TLastValue]>);
}

/**
 * Checks if any of the conditions is true, in sequence.
 * Stops at the first condition that returns true.
 */
export async function any(...conditions: Array<MaybeThunk<MaybeAsync<boolean>>>): Promise<boolean> {
    for (const condition of conditions) {
        if (await evalThunk(condition)) { return true; }
    }
    return false;
}

/**
 * Checks if all of the conditions are true, in sequence.
 * Stops at the first condition that returns false.
 */
export async function all(...conditions: Array<MaybeThunk<MaybeAsync<boolean>>>): Promise<boolean> {
    for (const condition of conditions) {
        if (!await evalThunk(condition)) { return false; }
    }
    return true;
}
