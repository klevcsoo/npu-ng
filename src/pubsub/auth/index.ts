import type { ChannelValueCondition } from "@/pubsub";
import { isNotOnLoginPage } from "@/pubsub/pathname";
import { readNeptunCode } from "@/neptun.ts";

export function isAuthenticated(): [
    ChannelValueCondition<"Pathname">,
    ChannelValueCondition<"DOMMutation">,
] {
    return [
        isNotOnLoginPage(),
        {
            channelName: "DOMMutation",
            evaluateCondition() {
                const neptuneCode = readNeptunCode();
                return !!neptuneCode && neptuneCode.length > 0;
            },
        },
    ];
}
