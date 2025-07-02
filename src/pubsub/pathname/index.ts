import { type ChannelValueCondition } from "@/pubsub";

export function pathnameMatches(pathnameRegex: RegExp): ChannelValueCondition<"pathname"> {
    return {
        channelName: "pathname",
        evaluateCondition(pathname) {
            return !!pathname.match(pathnameRegex);
        },
    };
}

export function pathnameDoesNotMatch(pathnameRegex: RegExp): ChannelValueCondition<"pathname"> {
    return {
        channelName: "pathname",
        evaluateCondition(pathname) {
            return !pathname.match(pathnameRegex);
        },
    };
}
