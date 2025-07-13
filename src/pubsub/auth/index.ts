import type { ChannelValueCondition } from "@/pubsub/types.ts";
import { isNotOnLoginPage } from "@/pubsub/pathname";
import { entryNotPresentInStorage, entryPresentInStorage } from "@/pubsub/storage";
import { sessionStorage, storageKeys } from "@/storage.ts";

export function sessionIsAuthenticated(): [
    ChannelValueCondition<"Pathname">,
    ChannelValueCondition<"SessionStorage">,
    ChannelValueCondition<"SessionStorage">,
] {
    return [
        isNotOnLoginPage(),
        entryPresentInStorage(sessionStorage("access_token", { prefix: "" })),
        entryNotPresentInStorage(sessionStorage("amp_session_id", { prefix: "" }), {
            orMatches: /^anonymous$/,
        }),
    ];
}

export function lastSessionWasCleanlyEnded(): ChannelValueCondition<"SessionStorage"> {
    return entryPresentInStorage(
        sessionStorage(storageKeys.sessionStorage.lastSessionEndedCleanly),
        { andMatches: /^true$/ },
    );
}

export function lastSessionWasInterrupted(): ChannelValueCondition<"SessionStorage"> {
    return entryNotPresentInStorage(
        sessionStorage(storageKeys.sessionStorage.lastSessionEndedCleanly),
        { orDoesNotMatch: /^true$/ },
    );
}
