import type { ChannelName } from "@/pubsub/types.ts";

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

export interface StorageKey<C extends Extract<ChannelName, "LocalStorage" | "SessionStorage">>
    extends StorageOperations {
    pubSubChannelName: C;
}

export function sessionStorage(
    key: string,
    options?: StorageAccessOptions,
): StorageKey<"SessionStorage">;
export function sessionStorage(
    index: number,
    options?: StorageAccessOptions,
): StorageKey<"SessionStorage">;
export function sessionStorage(
    keyOrIndex: string | number,
    options?: StorageAccessOptions,
): StorageKey<"SessionStorage"> {
    const ops = createStorageOperations(window.sessionStorage, keyOrIndex, options);
    return { pubSubChannelName: "SessionStorage", ...ops };
}

export function localStorage(
    key: string,
    options?: StorageAccessOptions,
): StorageKey<"LocalStorage">;
export function localStorage(
    index: number,
    options?: StorageAccessOptions,
): StorageKey<"LocalStorage">;
export function localStorage(
    keyOrIndex: string | number,
    options?: StorageAccessOptions,
): StorageKey<"LocalStorage"> {
    const ops = createStorageOperations(window.localStorage, keyOrIndex, options);
    return { pubSubChannelName: "LocalStorage", ...ops };
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

    try {
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
    } catch (e) {
        storageError(String(e));
    }
}

function storageError(message?: string): never {
    const errorMessage = !!message ? `StorageError: ${String(message)}` : "StorageError";
    throw new Error(errorMessage);
}
