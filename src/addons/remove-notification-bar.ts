import type { Addon } from "@/addons/types.ts";
import { injectStyle } from "@/theme.ts";

export default function removeNotificationBar(): Addon {
    injectStyle({
        "ngx-headroom neptun-notification-bar": {
            display: "none",
        },
    });

    return {
        name: "remove-notification-bar",
        initialise() {},
    };
}
