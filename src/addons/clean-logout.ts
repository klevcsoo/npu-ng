import type { Addon } from "@/addons/types.ts";
import { when } from "@/pubsub";
import { isAuthenticated } from "@/pubsub/auth";
import { elementVisibleInDOM } from "@/pubsub/dom";
import { sessionStorage } from "@/storage.ts";

export const STORAGE_KEY__CLEAN_LOGOUT = "clean-logout";

export default function cleanLogout(): Addon {
    const logoutButton = () =>
        $<HTMLButtonElement>(
            ".cdk-overlay-container .enrollment-info + mat-toolbar mat-toolbar-row:last-child",
        );

    return {
        name: "clean-logout",
        initialise() {
            const setCleanLogoutFlag = () => {
                sessionStorage(STORAGE_KEY__CLEAN_LOGOUT).set(true);
            };

            when(isAuthenticated(), elementVisibleInDOM(logoutButton))
                .execute(() => {
                    logoutButton().off("click", setCleanLogoutFlag);
                })
                .execute(() => {
                    logoutButton().on("click", setCleanLogoutFlag);
                });
        },
    };
}
