export const neptunTheme = {
    colours: {
        background: {
            default: "#ffffff",
            elevated: "#f2f3fb",
            elevatedHover: "#e6eaf9",
        },
        foreground: {
            darkest: "#222222",
            default: "#213055",
        },
    },
    radius: {
        medium: "8px",
    },
} as const;

export function injectStyle(style: Record<string, Record<string, string>>): void {
    const content = Object.entries(style).reduce((out, [selector, ruleMap]) => {
        const rules = Object.entries(ruleMap).map(([property, value]) => {
            return `${property}:${value}`;
        });
        return out + `${selector}{${rules.join(";")}}`;
    }, "");

    // noinspection HtmlDeprecatedAttribute
    $(`<style type="text/css">${content}</style>`).appendTo("head");
}
