import { createChannel } from "@/pubsub/lib.ts";
import type { Channel } from "@/pubsub/types.ts";

export function createPathnameChannel(): Channel<"Pathname"> {
    return createChannel((publish) => {
        const pushState = window.history.pushState;
        const replaceState = window.history.replaceState;

        function onUrlChange() {
            publish(window.location.pathname);
        }

        window.history.pushState = function (...args: Parameters<typeof pushState>) {
            const result = pushState.apply(window.history, args);
            onUrlChange();
            return result;
        };

        window.history.replaceState = function (...args: Parameters<typeof pushState>) {
            const result = replaceState.apply(window.history, args);
            onUrlChange();
            return result;
        };

        window.addEventListener("popstate", onUrlChange); // Back/forward buttons
    });
}
