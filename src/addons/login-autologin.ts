import type { Addon } from "@/addons/index.ts";
import { when } from "@/pubsub";
import { isOnLoginPage } from "@/pubsub/pathname";
import { elementVisibleInDOM } from "@/pubsub/dom";
import { injectStyle, neptunTheme } from "@/theme.ts";
import { ELEMENT_ID__USER_SELECT } from "@/addons/login-saved-users.ts";
import { dispatchNativeEventNG } from "@/angular.ts";

export const ELEMENT_ID__CANCEL_BUTTON = "npu-ng-cancel-autologin";

export default function loginAutologin(): Addon {
    const loginForm = () => $<HTMLFormElement>("neptun-login-form form");
    const loginButton = () => $<HTMLFormElement>("neptun-login-form #login-button");
    const userSelect = () => $<HTMLSelectElement>(`#${ELEMENT_ID__USER_SELECT}`);

    injectStyle({
        [`#${ELEMENT_ID__CANCEL_BUTTON}`]: {
            width: "100%",
            height: "44px",
            cursor: "pointer",
            padding: "1rem",
            "margin-top": "12px",
            color: neptunTheme.colours.foreground.default,
            "background-color": neptunTheme.colours.background.elevated,
            border: "none",
            "border-radius": neptunTheme.radius.medium,
            display: "flex",
            "flex-direction": "row",
            "align-items": "center",
            "justify-content": "center",
            gap: "0.5rem",
            "font-size": "16px",
        },
        [`#${ELEMENT_ID__CANCEL_BUTTON}:hover`]: {
            background: neptunTheme.colours.background.elevatedHover,
        },
    });

    const autologinTimeoutMs = 3000;

    return {
        name: "login-autologin",
        initialise() {
            let currentAnimationFrame: number | undefined = undefined;
            let userSelectChangeCallback: VoidFunction | undefined = undefined;

            when(isOnLoginPage(), elementVisibleInDOM(loginButton), elementVisibleInDOM(userSelect))
                .execute(() => {
                    const selectedUser = userSelect().val();
                    if (!selectedUser || selectedUser === "-") return;

                    const loginButtonLabel = loginButton().find("span.neptun-button__label");

                    const cancelButton = $(
                        `<button id='${ELEMENT_ID__CANCEL_BUTTON}'>Megszakítás</button>`,
                    ).prepend(
                        $('<i class="icon-x"/>')
                            .css("font-size", "24px")
                            .css("color", neptunTheme.colours.foreground.default),
                    );

                    const commitAutoLogin = () => {
                        currentAnimationFrame = undefined;

                        loginButtonLabel.text("Bejelentkezés");
                        cancelButton.remove();

                        dispatchNativeEventNG(loginButton().trigger("click"), "click");
                    };

                    const cancelAutologin = () => {
                        if (!!currentAnimationFrame) {
                            cancelAnimationFrame(currentAnimationFrame);
                        }

                        loginButtonLabel.text("Bejelentkezés");
                        cancelButton.remove();
                    };

                    loginButton().on("click", () => cancelAutologin());
                    cancelButton.on("click", () => cancelAutologin());
                    userSelectChangeCallback = () => cancelAutologin();
                    userSelect().on("change", userSelectChangeCallback);

                    const initTime = Date.now();
                    const animate = () => {
                        const timePassed = Date.now() - initTime;
                        const secondsPassed = Math.abs(
                            Math.floor((timePassed - autologinTimeoutMs) / 1000),
                        );

                        loginButtonLabel.text(`Automatikus bejelentkezés... ${secondsPassed}`);

                        if (timePassed > autologinTimeoutMs) {
                            commitAutoLogin();
                        } else {
                            currentAnimationFrame = requestAnimationFrame(animate);
                        }
                    };
                    currentAnimationFrame = requestAnimationFrame(animate);

                    loginForm().append(cancelButton);
                })
                .otherwise(() => {
                    if (!!currentAnimationFrame) {
                        cancelAnimationFrame(currentAnimationFrame);
                    }

                    if (!!userSelectChangeCallback) {
                        userSelect().off("change", userSelectChangeCallback);
                    }

                    $(`#${ELEMENT_ID__CANCEL_BUTTON}`).remove();
                });
        },
    };
}
