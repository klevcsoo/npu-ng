import type { ChannelName, ChannelValueCondition } from "@/pubsub/types.ts";

export function presentInSessionStorage(key: string): ChannelValueCondition<"SessionStorage"> {
    return presentInStorage(window.sessionStorage, "SessionStorage", key);
}

export function matchesInSessionStorage(
    key: string,
    valueRegex: RegExp,
): ChannelValueCondition<"SessionStorage"> {
    return presentInStorage(window.sessionStorage, "SessionStorage", key, valueRegex);
}

export function presentInLocalStorage(key: string): ChannelValueCondition<"LocalStorage"> {
    return presentInStorage(window.localStorage, "LocalStorage", key);
}

export function matchesInLocalStorage(
    key: string,
    valueRegex: RegExp,
): ChannelValueCondition<"LocalStorage"> {
    return presentInStorage(window.localStorage, "LocalStorage", key, valueRegex);
}

function presentInStorage<C extends Extract<ChannelName, "SessionStorage" | "LocalStorage">>(
    storage: Storage,
    channelName: C,
    key: string,
    valueRegex?: RegExp,
): ChannelValueCondition<C> {
    return {
        channelName: channelName,
        evaluateCondition() {
            const value = storage.getItem(key);
            return !!value && (!valueRegex || !!value.match(valueRegex));
        },
    };
}
