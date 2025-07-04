import { createPathnameChannel } from "@/pubsub/pathname/lib.ts";
import { createDOMMutationChannel } from "@/pubsub/dom/lib.ts";
import { createLocalStorageChannel, createSessionStorageChannel } from "@/pubsub/storage/lib.ts";
import type {
    Channel,
    ChannelName,
    ChannelPublicationTypeMap,
    ChannelValueCondition,
} from "@/pubsub/types.ts";

const channelMap: { [name in ChannelName]: Channel<name> } = {
    Pathname: createPathnameChannel(),
    DOMMutation: createDOMMutationChannel(),
    SessionStorage: createSessionStorageChannel(),
    LocalStorage: createLocalStorageChannel(),
};

export function subscribeTo<C extends ChannelName>(
    channel: C,
    onPublish: (value: ChannelPublicationTypeMap[C]) => void,
): VoidFunction {
    channelMap[channel].on(onPublish);
    return () => {
        channelMap[channel].off(onPublish);
    };
}

export function when(
    ...conditionList: (ChannelValueCondition<ChannelName> | ChannelValueCondition<ChannelName>[])[]
) {
    type ConditionKey = `${ChannelName}-${number}`;

    const flatConditionList = conditionList.flat();
    const conditionMap: { [name in ConditionKey]: boolean } = flatConditionList.reduce(
        (previousValue, currentValue, currentIndex) => {
            return { ...previousValue, [`${currentValue.channelName}-${currentIndex}`]: false };
        },
        {} as { [name in ConditionKey]: boolean },
    );

    const handlers: {
        executors: ((forceReevaluate: VoidFunction) => void)[];
        destroyers: VoidFunction[];
    } = {
        executors: [],
        destroyers: [],
    };

    let previous: boolean = false;
    const evaluateConditionMap = () => {
        const current = Object.values(conditionMap).every((v) => v);

        const reevaluate = () => {
            for (const f of handlers.destroyers) f();
            for (const f of handlers.executors) f(reevaluate);
        };

        if (!previous && current) {
            for (const f of handlers.executors) f(reevaluate);
        } else if (previous && !current) {
            for (const f of handlers.destroyers) f();
        }

        previous = current;
    };

    for (let i = 0; i < flatConditionList.length; i++) {
        const condition = flatConditionList[i];
        subscribeTo(condition.channelName, (value) => {
            conditionMap[`${condition.channelName}-${i}`] = condition.evaluateCondition(value);
            evaluateConditionMap();
        });
    }

    return {
        execute(handler: (forceReevaluate: VoidFunction) => void) {
            handlers.executors.push(handler);
            return this;
        },
        otherwise(handler: VoidFunction) {
            handlers.destroyers.push(handler);
            return this;
        },
    };
}
