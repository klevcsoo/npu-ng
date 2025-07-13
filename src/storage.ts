import type { ChannelName } from "@/pubsub/types.ts";

const STORAGE_KEY_PREFIX = "NPU-NG::";

export const storageKeys = {
    sessionStorage: {
        lastSessionEndedCleanly: "LAST-SESSION-ENDED-CLEANLY",
        currentLogoutUserInitiated: "CURRENT-LOGOUT-WAS-USER-INITIATED",
        lastVisitedPathname: "LAST-VISITED-PATHNAME",
    },
    localStorage: {
        savedUsersJSON: "SAVED-USERS",
        lastLoginUsername: "LAST-LOGIN-USERNAME",
    },
} as const;

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
    keyName: string;
    pubSubChannelName: C;
}

export function sessionStorage(
    key: string,
    options?: StorageAccessOptions,
): StorageKey<"SessionStorage"> {
    const prefix = options?.prefix !== undefined ? options.prefix : STORAGE_KEY_PREFIX;
    const keyName = prefix + key;

    const ops = createStorageOperations("session", keyName);
    return { pubSubChannelName: "SessionStorage", keyName, ...ops };
}

export function localStorage(
    key: string,
    options?: StorageAccessOptions,
): StorageKey<"LocalStorage"> {
    const prefix = options?.prefix !== undefined ? options.prefix : STORAGE_KEY_PREFIX;
    const keyName = prefix + key;

    const ops = createStorageOperations("local", keyName);
    return { pubSubChannelName: "LocalStorage", keyName, ...ops };
}

function createStorageOperations(storageType: "local" | "session", key: string): StorageOperations {
    const resolveStorage = (): Storage => {
        switch (storageType) {
            case "local":
                return window.localStorage;
            case "session":
                return window.sessionStorage;
            default:
                storageError(`Invalid storage type: ${storageType}`);
        }
    };

    try {
        return {
            get<T>(transformer?: (value: string | undefined) => T) {
                const storage = resolveStorage();
                const value = storage.getItem(key) ?? undefined;
                if (!!transformer) return transformer(value);
                else return value;
            },
            set(valueOrTransformer) {
                const storage = resolveStorage();
                const value =
                    typeof valueOrTransformer === "function"
                        ? (valueOrTransformer as Function)(storage.getItem(key) ?? undefined)
                        : valueOrTransformer;
                const parsed = typeof value === "object" ? JSON.stringify(value) : String(value);
                storage.setItem(key, parsed);
            },
            delete() {
                const storage = resolveStorage();
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
