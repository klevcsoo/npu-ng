import type { Addon } from "@/addons/types.ts";
import { subscribeTo, when } from "@/pubsub";
import { lastSessionWasInterrupted, sessionIsAuthenticated } from "@/pubsub/auth";
import { sessionStorage, storageKeys } from "@/storage.ts";

export default function workspacePersistence(): Addon {
    return {
        name: "workspace-persistence",
        initialise() {
            let unsubscribeFromPathnameChannel: VoidFunction | undefined = undefined;
            when(sessionIsAuthenticated())
                .execute(() => {
                    unsubscribeFromPathnameChannel = subscribeTo("Pathname", (pathname) => {
                        sessionStorage(storageKeys.sessionStorage.lastVisitedPathname).set(
                            pathname,
                        );
                    });
                })
                .otherwise(() => {
                    if (!!unsubscribeFromPathnameChannel) {
                        unsubscribeFromPathnameChannel();
                    }
                });

            when(sessionIsAuthenticated(), lastSessionWasInterrupted()).execute(() => {
                console.log(
                    `navigating to ${sessionStorage(storageKeys.sessionStorage.lastVisitedPathname).get()}`,
                );
            });
        },
    };
}
