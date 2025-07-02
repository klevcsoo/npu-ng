import type { Channel } from "@/pubsub";
import { createChannel } from "@/pubsub/lib.ts";

export function createDOMMutationChannel(): Channel<"domMutation"> {
    return createChannel((publish) => {
        const observer = new MutationObserver(publish);
        observer.observe(document.body, { subtree: true, childList: true });
    });
}
