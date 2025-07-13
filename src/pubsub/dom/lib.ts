import { createChannel } from "@/pubsub/lib.ts";
import type { Channel } from "@/pubsub/types.ts";

export function createDOMMutationChannel(): Channel<"DOMMutation"> {
    return createChannel(
        (publish) => {
            const observer = new MutationObserver(publish);
            observer.observe(document.body, { subtree: true, childList: true });
        },
        () => [],
    );
}
