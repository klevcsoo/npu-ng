import { type ChannelValueCondition } from "@/pubsub";

export function pathnameMatches(pathnameRegex: RegExp): ChannelValueCondition<"Pathname"> {
    return {
        channelName: "Pathname",
        evaluateCondition(pathname) {
            return !!pathname.match(pathnameRegex);
        },
    };
}

export function pathnameDoesNotMatch(pathnameRegex: RegExp): ChannelValueCondition<"Pathname"> {
    return {
        channelName: "Pathname",
        evaluateCondition(pathname) {
            return !pathname.match(pathnameRegex);
        },
    };
}

export function isOnLoginPage(): ChannelValueCondition<"Pathname"> {
    return pathnameMatches(/^\/[^\/]*\/login(\/.*)?/);
}

export function isNotOnLoginPage(): ChannelValueCondition<"Pathname"> {
    return pathnameDoesNotMatch(/^\/[^\/]*\/login(\/.*)?/);
}
