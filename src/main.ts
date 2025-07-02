import type { Addon } from "@/addons";
import debugBox from "@/addons/debug-box.ts";

const addons: Addon[] = [debugBox];

for (const addon of addons) {
    addon.initialise();
    console.log(`%cADDON INITIALISED: ${addon.name}`, "font-weight: bold");
}
