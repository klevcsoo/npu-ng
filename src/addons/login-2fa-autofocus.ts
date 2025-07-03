import type { Addon } from "@/addons/index.ts";
import { when } from "@/pubsub";
import { isOnLoginPage } from "@/pubsub/pathname";
import { elementVisibleInDOM } from "@/pubsub/dom";

export default function login2faAutofocus(): Addon {
    return {
        name: "login-2fa-autofocus",
        initialise() {
            const twoFACodeInput = () => {
                return $("neptun-two-factor-dialog-content #two-factor-qr-code-input-form-input");
            };

            when(isOnLoginPage(), elementVisibleInDOM(twoFACodeInput)).execute(() => {
                twoFACodeInput().trigger("focus");
            });
        },
    };
}
