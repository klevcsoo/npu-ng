import type { Addon } from "@/addons/index.ts";
import { when } from "@/pubsub";
import { pathnameDoesNotMatch, pathnameMatches } from "@/pubsub/pathname";

export default {
    name: "debug-box",
    initialise() {
        const colour = Math.round(Math.random() * 0xffffff).toString(16);

        when(pathnameMatches(/hallgato_ng/g), pathnameDoesNotMatch(/login/g))
            .execute(() => {
                document
                    .querySelector("app-root")!
                    .insertAdjacentHTML(
                        "beforebegin",
                        `<div id="${colour}" style="background-color: #${colour}; width: 100px; height: 100px;"></div>`,
                    );
            })
            .otherwise(() => {
                document.getElementById(colour)?.remove();
            });
    },
} satisfies Addon;
