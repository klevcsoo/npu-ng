import type { ChannelValueCondition } from "@/pubsub/types.ts";

export function elementVisibleInDOM(
    generator: () => JQuery<HTMLElement> | null | undefined,
    options?: CheckVisibilityOptions,
): ChannelValueCondition<"DOMMutation"> {
    return {
        channelName: "DOMMutation",
        evaluateCondition() {
            const elements = generator();
            return (
                !!elements &&
                elements.length > 0 &&
                elements.toArray().some((e) => e.checkVisibility(options))
            );
        },
    };
}

export function elementNotVisibleInDom(
    generator: () => JQuery<HTMLElement> | null | undefined,
    options?: CheckVisibilityOptions,
): ChannelValueCondition<"DOMMutation"> {
    return {
        channelName: "DOMMutation",
        evaluateCondition() {
            const elements = generator();
            return (
                !elements ||
                elements.length === 0 ||
                elements.toArray().every((e) => !e.checkVisibility(options))
            );
        },
    };
}
