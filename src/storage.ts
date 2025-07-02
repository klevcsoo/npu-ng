const STORAGE_KEY_PREFIX = "npu-ng";

interface StorageOperations {
    get(): string | undefined;
    get<T>(transformer: (value: string | undefined) => T): T;
    set<T>(value: T): void;
    delete(): void;
}

export function sessionStorage(key: string): StorageOperations;
export function sessionStorage(index: number): StorageOperations;
export function sessionStorage(keyOrIndex: string | number): StorageOperations {
    return createStorageOperations(window.sessionStorage, keyOrIndex);
}

export function localStorage(key: string): StorageOperations;
export function localStorage(index: number): StorageOperations;
export function localStorage(keyOrIndex: string | number): StorageOperations {
    return createStorageOperations(window.localStorage, keyOrIndex);
}

function createStorageOperations(storage: Storage, keyOrIndex: string | number): StorageOperations {
    const key =
        typeof keyOrIndex === "number"
            ? storage.key(keyOrIndex)
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
        set(value) {
            const v = typeof value === "object" ? JSON.stringify(value) : String(value);
            storage.setItem(key, v);
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
