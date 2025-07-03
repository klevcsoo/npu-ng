/**
 * Dispatches events using a native DOM element, so that
 * the Angular Event Loop can react to changes accordingly.
 * @param element
 * @param events
 */
export function dispatchNativeEventNG<E extends HTMLElement>(element: E, ...events: string[]): void;
export function dispatchNativeEventNG<E extends HTMLElement>(
    element: JQuery<E>,
    ...events: string[]
): void;
export function dispatchNativeEventNG<E extends HTMLElement>(
    element: E | JQuery<E>,
    ...events: string[]
) {
    const dispatch = (element: HTMLElement) => {
        for (const e of events) {
            element.dispatchEvent(new Event(e, { bubbles: true }));
        }
    };

    if (element instanceof HTMLElement) dispatch(element);
    else for (const e of element.get()) dispatch(e);
}
