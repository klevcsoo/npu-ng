import { createPathnameChannel } from "@/pubsub/pathname/lib.ts";
import { createDOMMutationChannel } from "@/pubsub/dom/lib.ts";

export interface ChannelPublicationTypeMap {
    pathname: string;
    domMutation: MutationRecord[];
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

const channelMap: { [name in ChannelName]: Channel<name> } = {
    pathname: createPathnameChannel(),
    domMutation: createDOMMutationChannel(),
};

export function when(...conditionList: ChannelValueCondition<keyof ChannelPublicationTypeMap>[]) {
    type ConditionKey = `${ChannelName}-${number}`;

    const conditionMap: { [name in ConditionKey]: boolean } = conditionList.reduce(
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

    for (let i = 0; i < conditionList.length; i++) {
        const condition = conditionList[i];
        channelMap[condition.channelName].on((value) => {
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
