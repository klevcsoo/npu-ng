import type { Addon } from "@/addons/types.ts";
import login2faAutofocus from "@/addons/login-2fa-autofocus.ts";
import loginSavedUsers from "@/addons/login-saved-users.ts";
import loginAutologin from "@/addons/login-autologin.ts";
import removeNotificationBar from "@/addons/remove-notification-bar.ts";

const addons: Addon[] = [
    login2faAutofocus(),
    loginAutologin(),
    loginSavedUsers(),
    removeNotificationBar(),
];

for (const addon of addons) {
    try {
        addon.initialise();
        console.log(`%cADDON INITIALISED: ${addon.name}`, "font-weight: bold");
    } catch (e) {
        console.warn(`%cFAILED TO INITIALISE ADDON: ${addon.name}`, "font-weight: bold");
        console.error(e);
    }
}
