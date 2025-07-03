import type { Addon } from "@/addons/index.ts";
import { when } from "@/pubsub";
import { isOnLoginPage } from "@/pubsub/pathname";
import { elementVisibleInDOM } from "@/pubsub/dom";
import { dispatchNativeEventNG } from "@/angular.ts";

export default function login2faAutofocus(): Addon {
    const twoFACodeInput = () =>
        $("neptun-two-factor-dialog-content #two-factor-qr-code-input-form-input");

    return {
        name: "login-2fa-autofocus",
        initialise() {
            when(isOnLoginPage(), elementVisibleInDOM(twoFACodeInput)).execute(() => {
                dispatchNativeEventNG(twoFACodeInput().trigger("focus"), "focus");
            });
        },
    };
}
