import type { Addon } from "@/addons/index.ts";
import { injectStyle } from "@/theme.ts";

export default function removeNotificationBar(): Addon {
    return {
        name: "remove-notification-bar",
        initialise() {
            injectStyle({
                "ngx-headroom neptun-notification-bar": {
                    display: "none",
                },
            });
        },
    };
}
