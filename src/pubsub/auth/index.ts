import { isNotOnLoginPage } from "@/pubsub/pathname";
import type { ChannelValueCondition } from "@/pubsub/types.ts";
import { matchesInSessionStorage, presentInSessionStorage } from "@/pubsub/storage";

export function isAuthenticated(): [
    ChannelValueCondition<"Pathname">,
    ChannelValueCondition<"SessionStorage">,
    ChannelValueCondition<"SessionStorage">,
] {
    return [
        isNotOnLoginPage(),
        presentInSessionStorage("access_token"),
        matchesInSessionStorage("apm_session_id", /^((?!anonymous).)*$/),
    ];
}
