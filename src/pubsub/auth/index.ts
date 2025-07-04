import type { ChannelValueCondition } from "@/pubsub";
import { isNotOnLoginPage } from "@/pubsub/pathname";
import { readNeptunCode } from "@/neptun.ts";

export function isAuthenticated(): [
    ChannelValueCondition<"pathname">,
    ChannelValueCondition<"domMutation">,
] {
    return [
        isNotOnLoginPage(),
        {
            channelName: "domMutation",
            evaluateCondition() {
                const neptuneCode = readNeptunCode();
                return !!neptuneCode && neptuneCode.length > 0;
            },
        },
    ];
}
