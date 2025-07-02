import type { Addon } from "@/addons/index.ts";
import { when } from "@/pubsub";
import { isOnLoginPage } from "@/pubsub/pathname";
import { elementVisibleInDOM } from "@/pubsub/dom";
import { compileTemplate } from "@/templates.ts";

export default {
    name: "login-saved-users",
    initialise() {
        const languageDropdown = () =>
            document.querySelector<HTMLDivElement>("neptun-language-dropdown");

        when(isOnLoginPage(), elementVisibleInDOM(languageDropdown)).execute(() => {
            const container = languageDropdown()!;

            container.style.display = "flex";
            container.style.gap = "1rem";

            container.insertAdjacentHTML(
                "beforeend",
                compileTemplate("login-saved-user-select", { id: "test-id" }),
            );
        });
    },
} satisfies Addon;
