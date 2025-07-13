import type { ChannelValueCondition } from "@/pubsub/types.ts";
import { isNotOnLoginPage } from "@/pubsub/pathname";
import { entryNotPresentInStorage, entryPresentInStorage } from "@/pubsub/storage";
import { sessionStorage } from "@/storage.ts";

export function isAuthenticated(): [
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
