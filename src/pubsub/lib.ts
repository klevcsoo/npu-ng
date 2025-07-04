import type { Channel, ChannelName, ChannelPublicationTypeMap } from "@/pubsub/types.ts";

export function createChannel<C extends ChannelName>(
    handler: (publish: (value: ChannelPublicationTypeMap[C]) => void) => void,
): Channel<C> {
    const subscribers: ((value: ChannelPublicationTypeMap[C]) => void)[] = [];

    handler((value) => {
        for (const sub of subscribers) {
            sub(value);
        }
    });

    return {
        on(callback) {
            subscribers.push(callback);
        },
        off(callback) {
            subscribers.splice(subscribers.indexOf(callback), 1);
        },
    };
}
