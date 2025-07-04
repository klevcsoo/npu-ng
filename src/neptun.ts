export function readNeptunCode(): string | undefined {
    const codes = $(
        "#user-menu-button > div.user-menu__block.user-menu__has-badge > div.user-menu__user-data > div.user-menu__code",
    )
        .contents()
        .filter((_, element) => {
            return element.nodeType === Node.TEXT_NODE;
        })
        .map((_, element) => {
            return element.textContent?.trim().slice(1, -1);
        })
        .toArray();

    return codes.length > 0 ? codes[0] : undefined;
}
