import { createChannel } from "@/pubsub/lib.ts";
import type { Channel, ChannelName } from "@/pubsub/types.ts";

export function createSessionStorageChannel(): Channel<"SessionStorage"> {
    return createStorageChannel<"SessionStorage">(window.sessionStorage);
}

export function createLocalStorageChannel(): Channel<"LocalStorage"> {
    return createStorageChannel<"LocalStorage">(window.localStorage);
}

function createStorageChannel<C extends Extract<ChannelName, "SessionStorage" | "LocalStorage">>(
    storage: Storage,
): Channel<C> {
    return createChannel(
        (publish) => {
            const setItem = storage.setItem;
            const removeItem = storage.removeItem;
            const clear = storage.clear;

            storage.setItem = function (...args: Parameters<typeof setItem>) {
                const result = setItem.apply(storage, args);
                publish({ operation: "set", key: args[0], value: args[1] });
                return result;
            };

            storage.removeItem = function (...args: Parameters<typeof removeItem>) {
                const result = removeItem.apply(storage, args);
                publish({ operation: "remove", key: args[0] });
                return result;
            };

            storage.clear = function (...args: Parameters<typeof clear>) {
                const result = clear.apply(storage, args);
                publish({ operation: "clear" });
                return result;
            };
        },
        () => ({ operation: "clear" }),
    );
}
