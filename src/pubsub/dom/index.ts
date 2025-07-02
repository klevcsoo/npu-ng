import type { ChannelValueCondition } from "@/pubsub";

export function elementVisibleInDOM<E extends Element>(
    elementFunc: () => E | null,
    options?: CheckVisibilityOptions,
): ChannelValueCondition<"domMutation"> {
    return {
        channelName: "domMutation",
        evaluateCondition() {
            const element = elementFunc();
            return !!element && element.checkVisibility(options);
        },
    };
}

export function elementNotVisibleInDom<E extends Element>(
    elementFunc: () => E | null,
    options?: CheckVisibilityOptions,
) {
    return {
        channelName: "domMutation",
        evaluateCondition() {
            const element = elementFunc();
            return !element || !element.checkVisibility(options);
        },
    };
}
