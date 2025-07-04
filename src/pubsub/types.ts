export interface ChannelPublicationTypeMap {
    Pathname: string;
    DOMMutation: MutationRecord[];
    SessionStorage:
        | { operation: "set"; key: string; value: string }
        | { operation: "remove"; key: string }
        | { operation: "clear" };
    LocalStorage:
        | { operation: "set"; key: string; value: string }
        | { operation: "remove"; key: string }
        | { operation: "clear" };
}

export type ChannelName = keyof ChannelPublicationTypeMap;

export interface ChannelValueCondition<C extends ChannelName> {
    channelName: C;

    evaluateCondition(value: ChannelPublicationTypeMap[C]): boolean;
}

export interface Channel<C extends ChannelName> {
    on(callback: (value: ChannelPublicationTypeMap[C]) => void): void;

    off(callback: (value: ChannelPublicationTypeMap[C]) => void): void;
}
