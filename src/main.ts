import type { Addon } from "@/addons";
import debugBox from "@/addons/debug-box.ts";

const addons: Addon[] = [debugBox];

for (const addon of addons) {
    try {
        addon.initialise();
        console.log(`%cADDON INITIALISED: ${addon.name}`, "font-weight: bold");
    } catch (e) {
        console.warn(`%cFAILED TO INITIALISE ADDON: ${addon.name}`, "font-weight: bold");
        console.error(e);
    }
}
