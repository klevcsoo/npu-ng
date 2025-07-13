import type { Addon } from "@/addons/types.ts";
import { when } from "@/pubsub";
import { sessionIsAuthenticated } from "@/pubsub/auth";
import { elementVisibleInDOM } from "@/pubsub/dom";
import { sessionStorage, storageKeys } from "@/storage.ts";
import { isOnLoginPage } from "@/pubsub/pathname";

export default function cleanLogout(): Addon {
    const logoutButton = () =>
        $<HTMLButtonElement>(
            ".cdk-overlay-container .enrollment-info + mat-toolbar mat-toolbar-row:last-child",
        );

    return {
        name: "clean-logout",
        initialise() {
            const setCleanLogoutFlag = () => {
                sessionStorage(storageKeys.sessionStorage.currentLogoutUserInitiated).set(true);
            };

            when(sessionIsAuthenticated(), elementVisibleInDOM(logoutButton))
                .execute(() => {
                    logoutButton().off("click", setCleanLogoutFlag);
                })
                .execute(() => {
                    logoutButton().on("click", setCleanLogoutFlag);
                });

            when(isOnLoginPage()).execute(() => {
                if (
                    sessionStorage(storageKeys.sessionStorage.currentLogoutUserInitiated).get() ===
                    String(true)
                ) {
                    sessionStorage(storageKeys.sessionStorage.lastSessionEndedCleanly).set(true);
                } else {
                    sessionStorage(storageKeys.sessionStorage.lastSessionEndedCleanly).delete();
                }

                sessionStorage(storageKeys.sessionStorage.currentLogoutUserInitiated).delete();
            });
        },
    };
}
