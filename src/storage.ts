const STORAGE_KEY_PREFIX = "npu-ng";

interface StorageAccessOptions {
    prefix?: string;
}

interface StorageOperations {
    get(): string | undefined;
    get<T>(transformer: (value: string | undefined) => T): T;
    set<T>(value: T): void;
    set<T>(transformer: (value: string | undefined) => T): void;
    delete(): void;
}

export function sessionStorage(key: string, options?: StorageAccessOptions): StorageOperations;
export function sessionStorage(index: number, options?: StorageAccessOptions): StorageOperations;
export function sessionStorage(
    keyOrIndex: string | number,
    options?: StorageAccessOptions,
): StorageOperations {
    return createStorageOperations(window.sessionStorage, keyOrIndex, options);
}

export function localStorage(key: string, options?: StorageAccessOptions): StorageOperations;
export function localStorage(index: number, options?: StorageAccessOptions): StorageOperations;
export function localStorage(
    keyOrIndex: string | number,
    options?: StorageAccessOptions,
): StorageOperations {
    return createStorageOperations(window.localStorage, keyOrIndex, options);
}

function createStorageOperations(
    storage: Storage,
    keyOrIndex: string | number,
    options?: StorageAccessOptions,
): StorageOperations {
    const key =
        typeof keyOrIndex === "number"
            ? storage.key(keyOrIndex)
            : options?.prefix !== undefined
              ? `${options.prefix}${keyOrIndex}`
              : `${STORAGE_KEY_PREFIX}.${keyOrIndex}`;
    if (!key) {
        storageError(`Invalid key or index for session storage: ${keyOrIndex}`);
    }

    return {
        get<T>(transformer?: (value: string | undefined) => T) {
            const value = storage.getItem(key) ?? undefined;
            if (!!transformer) return transformer(value);
            else return value;
        },
        set(valueOrTransformer) {
            const value =
                typeof valueOrTransformer === "function"
                    ? (valueOrTransformer as Function)(storage.getItem(key) ?? undefined)
                    : valueOrTransformer;
            const parsed = typeof value === "object" ? JSON.stringify(value) : String(value);
            storage.setItem(key, parsed);
        },
        delete() {
            storage.removeItem(key);
        },
    };
}

function storageError(message?: string): never {
    const errorMessage = !!message ? `StorageError: ${String(message)}` : "StorageError";
    throw new Error(errorMessage);
}
