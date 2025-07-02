import type { Addon } from "@/addons/index.ts";
import { when } from "@/pubsub";
import { isOnLoginPage } from "@/pubsub/pathname";
import { elementVisibleInDOM } from "@/pubsub/dom";

export default {
    name: "login-2fa-autofocus",
    initialise() {
        when(
            isOnLoginPage(),
            elementVisibleInDOM(() => document.querySelector("neptun-two-factor-dialog-content")),
        ).execute(() => {
            document
                .querySelector<HTMLInputElement>("#two-factor-qr-code-input-form-input")
                ?.focus();
        });
    },
} satisfies Addon;
