import type { Addon } from "@/addons/types.ts";
import { when } from "@/pubsub";
import { isOnLoginPage } from "@/pubsub/pathname";
import { elementVisibleInDOM } from "@/pubsub/dom";
import { localStorage, storageKeys } from "@/storage.ts";
import { injectStyle, neptunTheme } from "@/theme.ts";
import { dispatchNativeEventNG } from "@/angular.ts";
import { entryChangesInStorage } from "@/pubsub/storage";

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
                entryChangesInStorage(localStorage(storageKeys.localStorage.savedUsersJSON)),
            )
                .execute(() => {
                    const savedUsers = localStorage(storageKeys.localStorage.savedUsersJSON).get<
                        Record<string, string>
                    >((value) => {
                        if (!value) return {};
                        return JSON.parse(value) as Record<string, string>;
                    });
                    console.log(savedUsers);

                    const userSelect = (() => {
                        const selectElement = $(
                            `<select id='${ELEMENT_ID__USER_SELECT}'></select>`,
                        );

                        if (Object.keys(savedUsers).length > 0) {
                            for (const username in savedUsers) {
                                selectElement.append(
                                    $(`<option value='${username}'>${username}</option>`),
                                );
                            }
                            selectElement
                                .append($($(`<option disabled value='-'>-</option>`)))
                                .append(
                                    $(`<option selected value='__new__'>Más felhasználó</option>`),
                                );

                            const lastLoginUsername = localStorage(
                                storageKeys.localStorage.lastLoginUsername,
                            ).get();
                            if (lastLoginUsername && !!savedUsers[lastLoginUsername]) {
                                selectElement.val(lastLoginUsername);

                                usernameInput().val(lastLoginUsername);
                                dispatchNativeEventNG(usernameInput(), "input", "change", "blur");

                                passwordInput().val(savedUsers[lastLoginUsername]);
                                dispatchNativeEventNG(passwordInput(), "input", "change", "blur");
                            }
                        } else {
                            selectElement.append(
                                $(
                                    "<option disabled selected value='-'>Nincs lementett felhasználó</option>",
                                ),
                            );
                        }

                        return selectElement;
                    })();

                    const userDeleteButton = $(
                        `<button id="${ELEMENT_ID__DELETE_USER_BUTTON}"></button>`,
                    ).append(
                        $('<i class="icon-trash"/>')
                            .css("font-size", "18px")
                            .css("color", neptunTheme.colours.foreground.default),
                    );

                    userSelect.on("change", () => {
                        const username = String(userSelect.val());

                        if (username === "__new__") {
                            usernameInput().val("");
                            passwordInput().val("");
                            userDeleteButton.remove();
                        } else if (!!savedUsers[username]) {
                            usernameInput().val(username);
                            passwordInput().val(savedUsers[username]);
                            userDeleteButton.appendTo(languageDropdown());
                        }

                        dispatchNativeEventNG(usernameInput(), "input", "change", "blur");
                        dispatchNativeEventNG(passwordInput(), "input", "change", "blur");
                    });

                    userDeleteButton.on("click", () => {
                        const activeUsername = String(userSelect.val());

                        const msg =
                            `Biztos, hogy törölni szertnéd ${activeUsername} ` +
                            "felhasználót a mentettek közül?";

                        if (confirm(msg)) {
                            usernameInput().val("");
                            dispatchNativeEventNG(usernameInput(), "input", "change", "blur");

                            passwordInput().val("");
                            dispatchNativeEventNG(passwordInput(), "input", "change", "blur");

                            localStorage(storageKeys.localStorage.savedUsersJSON).set<
                                Record<string, string>
                            >((value) => {
                                const parsed = JSON.parse(value ?? "{}");
                                delete parsed[activeUsername];
                                return parsed;
                            });
                        }
                    });

                    languageDropdown()
                        .css("display", "flex")
                        .css("flex-direction", "row")
                        .css("gap", "1rem")
                        .css("align-items", "stretch")
                        .append(userSelect);

                    if (!!savedUsers[String(userSelect.val())]) {
                        languageDropdown().append(userDeleteButton);
                    }
                })
                .otherwise(() => {
                    console.log("removing");
                    $(`#${ELEMENT_ID__USER_SELECT}`).remove();
                    $(`#${ELEMENT_ID__DELETE_USER_BUTTON}`).remove();
                });

            const loginButtonClickCallback = () => {
                const msg =
                    "Szeretnéd menteni a beírt adatokat, hogy később" +
                    "egy kattintással be tudj lépni erről a számítógépről?";
                const activeUsername = String(usernameInput().val());

                const usernameAlreadySaved = localStorage(
                    storageKeys.localStorage.savedUsersJSON,
                ).get((value) => {
                    if (!value) return false;
                    const parsed = JSON.parse(value) as Record<string, string>;
                    return !!parsed[activeUsername];
                });

                if (!usernameAlreadySaved && confirm(msg)) {
                    localStorage(storageKeys.localStorage.savedUsersJSON).set<
                        Record<string, string>
                    >((value) => {
                        const parsed = JSON.parse(value ?? "{}");
                        parsed[activeUsername] = String(passwordInput().val());
                        return parsed;
                    });
                }

                localStorage(storageKeys.localStorage.lastLoginUsername).set(activeUsername);
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
