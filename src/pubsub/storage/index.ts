import type { ChannelName, ChannelValueCondition } from "@/pubsub/types.ts";
import type { StorageKey } from "@/storage.ts";

export function entryPresentInStorage<
    C extends Extract<ChannelName, "SessionStorage" | "LocalStorage">,
>(
    key: StorageKey<C>,
    options?: { andMatches?: RegExp; andDoesNotMatch?: RegExp },
): ChannelValueCondition<C> {
    return {
        channelName: key.pubSubChannelName,
        needsEvaluation(payload) {
            return payload.operation === "clear" || payload.key === key.keyName;
        },
        evaluateCondition() {
            const value = key.get();
            return (
                !!value &&
                (!options?.andMatches || options.andMatches.test(value)) &&
                (!options?.andDoesNotMatch || !options.andDoesNotMatch.test(value))
            );
        },
    };
}

export function entryNotPresentInStorage<
    C extends Extract<ChannelName, "SessionStorage" | "LocalStorage">,
>(
    key: StorageKey<C>,
    options?: { orMatches?: RegExp; orDoesNotMatch?: RegExp },
): ChannelValueCondition<C> {
    return {
        channelName: key.pubSubChannelName,
        needsEvaluation(payload) {
            return payload.operation === "clear" || payload.key === key.keyName;
        },
        evaluateCondition() {
            const value = key.get();
            return (
                !value || options?.orMatches?.test(value) || !options?.orDoesNotMatch?.test(value)
            );
        },
    };
}

export function entryChangesInStorage<
    C extends Extract<ChannelName, "SessionStorage" | "LocalStorage">,
>(key: StorageKey<C>): ChannelValueCondition<C> {
    return {
        channelName: key.pubSubChannelName,
        requiresContextReloadOnTruthfulEvaluation: true,
        needsEvaluation(payload) {
            return payload.operation === "clear" || payload.key === key.keyName;
        },
        evaluateCondition() {
            return true;
        },
    };
}
