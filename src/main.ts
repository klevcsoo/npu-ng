import type { Addon } from "@/addons";
import login2faAutofocus from "@/addons/login-2fa-autofocus.ts";
import loginSavedUsers from "@/addons/login-saved-users.ts";
import loginAutologin from "@/addons/login-autologin.ts";

const addons: Addon[] = [login2faAutofocus(), loginAutologin(), loginSavedUsers()];

for (const addon of addons) {
    try {
        addon.initialise();
        console.log(`%cADDON INITIALISED: ${addon.name}`, "font-weight: bold");
    } catch (e) {
        console.warn(`%cFAILED TO INITIALISE ADDON: ${addon.name}`, "font-weight: bold");
        console.error(e);
    }
}
