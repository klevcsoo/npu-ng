import type { Addon } from "@/addons/types.ts";
import { when } from "@/pubsub";
import { isOnLoginPage } from "@/pubsub/pathname";
import { elementVisibleInDOM } from "@/pubsub/dom";
import { localStorage } from "@/storage.ts";
import { injectStyle, neptunTheme } from "@/theme.ts";
import { dispatchNativeEventNG } from "@/angular.ts";

export const STORAGE_KEY__SAVED_USERS = "saved-users";
export const STORAGE_KEY__LAST_LOGIN_USERNAME = "last-login-username";

export const ELEMENT_ID__USER_SELECT = "npu-ng-saved-users";
export const ELEMENT_ID__DELETE_USER_BUTTON = "npu-ng-delete-user";

export default function loginSavedUsers(): Addon {
    const languageDropdown = () => $("neptun-login-form neptun-language-dropdown");
    const usernameInput = () => $("neptun-login-form #userName");
    const passwordInput = () => $("neptun-login-form neptun-form-password input[type=password]");
    const loginButton2FA = () => $("neptun-two-factor-dialog-content #login-button");

    injectStyle({
        [`#${ELEMENT_ID__USER_SELECT}`]: {
            width: "100%",
            height: "auto",
            cursor: "pointer",
            "padding-left": "1rem",
            color: neptunTheme.colours.foreground.default,
            "background-color": neptunTheme.colours.background.elevated,
            border: "none",
            "border-right": "1rem solid transparent",
            "border-radius": neptunTheme.radius.medium,
        },
        [`#${ELEMENT_ID__DELETE_USER_BUTTON}`]: {
            "min-width": "48px",
            height: "auto",
            cursor: "pointer",
            padding: "0.5rem",
            color: neptunTheme.colours.foreground.default,
            "background-color": neptunTheme.colours.background.elevated,
            border: "none",
            "border-radius": neptunTheme.radius.medium,
        },
        [`#${ELEMENT_ID__DELETE_USER_BUTTON}:hover`]: {
            background: neptunTheme.colours.background.elevatedHover,
        },
    });

    return {
        name: "login-saved-users",
        initialise() {
            when(
                isOnLoginPage(),
                elementVisibleInDOM(languageDropdown),
                elementVisibleInDOM(usernameInput),
                elementVisibleInDOM(passwordInput),
            )
                .execute((forceReevaluate) => {
                    const savedUsers = localStorage(STORAGE_KEY__SAVED_USERS).get<
                        Record<string, string>
                    >((value) => {
                        if (!value) return {};
                        return JSON.parse(value) as Record<string, string>;
                    });

                    const userSelect = (() => {
                        const selectElement = $(
                            `<select id='${ELEMENT_ID__USER_SELECT}'></select>`,
                        ).on("change", () => {
                            const username = String(selectElement.val());

                            if (username === "__new__") {
                                usernameInput().val("");
                                passwordInput().val("");
                            } else if (!!savedUsers[username]) {
                                usernameInput().val(username);
                                passwordInput().val(savedUsers[username]);
                            }

                            dispatchNativeEventNG(usernameInput(), "input", "change", "blur");
                            dispatchNativeEventNG(passwordInput(), "input", "change", "blur");
                        });

                        if (Object.keys(savedUsers).length > 0) {
                            for (const username in savedUsers) {
                                selectElement.prepend(
                                    $(`<option id='${username}'>${username}</option>`),
                                );
                            }

                            const lastLoginUsername = localStorage(
                                STORAGE_KEY__LAST_LOGIN_USERNAME,
                            ).get();
                            if (lastLoginUsername && !!savedUsers[lastLoginUsername]) {
                                selectElement.val(lastLoginUsername);

                                usernameInput().val(lastLoginUsername);
                                dispatchNativeEventNG(usernameInput(), "input", "change", "blur");

                                passwordInput().val(savedUsers[lastLoginUsername]);
                                dispatchNativeEventNG(passwordInput(), "input", "change", "blur");
                            }
                        } else {
                            selectElement.prepend(
                                $(
                                    "<option disabled selected value='-'>Nincs lementett felhasználó</option>",
                                ),
                            );
                        }

                        return selectElement;
                    })();

                    const userDeleteButton = $(
                        `<button id="${ELEMENT_ID__DELETE_USER_BUTTON}"></button>`,
                    )
                        .append(
                            $('<i class="icon-trash"/>')
                                .css("font-size", "18px")
                                .css("color", neptunTheme.colours.foreground.default),
                        )
                        .on("click", () => {
                            const activeUsername = String(userSelect.val());

                            const msg =
                                `Biztos, hogy törölni szertnéd ${activeUsername} ` +
                                "felhasználót a mentettek közül?";

                            if (confirm(msg)) {
                                localStorage(STORAGE_KEY__SAVED_USERS).set<Record<string, string>>(
                                    (value) => {
                                        const parsed = JSON.parse(value ?? "{}");
                                        delete parsed[activeUsername];
                                        return parsed;
                                    },
                                );

                                usernameInput().val("");
                                dispatchNativeEventNG(usernameInput(), "input", "change", "blur");

                                passwordInput().val("");
                                dispatchNativeEventNG(passwordInput(), "input", "change", "blur");

                                forceReevaluate();
                            }
                        });

                    languageDropdown()
                        .css("display", "flex")
                        .css("flex-direction", "row")
                        .css("gap", "1rem")
                        .css("align-items", "stretch")
                        .append(userSelect);

                    if (Object.keys(savedUsers).length > 0) {
                        languageDropdown().append(userDeleteButton);
                    }
                })
                .otherwise(() => {
                    $(`#${ELEMENT_ID__USER_SELECT}`).remove();
                    $(`#${ELEMENT_ID__DELETE_USER_BUTTON}`).remove();
                });

            const loginButtonClickCallback = () => {
                const msg =
                    "Szeretnéd menteni a beírt adatokat, hogy később" +
                    "egy kattintással be tudj lépni erről a számítógépről?";
                const activeUsername = String(usernameInput().val());

                const usernameAlreadySaved = localStorage(STORAGE_KEY__SAVED_USERS).get((value) => {
                    if (!value) return false;
                    const parsed = JSON.parse(value) as Record<string, string>;
                    return !!parsed[activeUsername];
                });

                if (!usernameAlreadySaved && confirm(msg)) {
                    localStorage(STORAGE_KEY__SAVED_USERS).set<Record<string, string>>((value) => {
                        const parsed = JSON.parse(value ?? "{}");
                        parsed[activeUsername] = String(passwordInput().val());
                        return parsed;
                    });
                }

                localStorage(STORAGE_KEY__LAST_LOGIN_USERNAME).set(activeUsername);
            };

            when(isOnLoginPage(), elementVisibleInDOM(loginButton2FA))
                .execute(() => {
                    loginButton2FA().on("click", loginButtonClickCallback);
                })
                .otherwise(() => {
                    loginButton2FA().off("click", loginButtonClickCallback);
                });
        },
    };
}
