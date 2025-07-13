import type { Channel, ChannelName, ChannelPublicationTypeMap } from "@/pubsub/types.ts";

export function createChannel<C extends ChannelName>(
    setup: (publish: (value: ChannelPublicationTypeMap[C]) => void) => void,
    initialValue: () => ChannelPublicationTypeMap[C],
): Channel<C> {
    const subscribers: ((value: ChannelPublicationTypeMap[C]) => void)[] = [];

    setup((value) => {
        for (const sub of subscribers) {
            sub(value);
        }
    });

    return {
        on(callback) {
            subscribers.push(callback);
            callback(initialValue());
        },
        off(callback) {
            subscribers.splice(subscribers.indexOf(callback), 1);
        },
    };
}
