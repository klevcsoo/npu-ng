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

    // flatten the condition list
    const internalConditionList = conditionList.flat();

    // build the condition map, where a channel name and index is
    // assigned to every condition
    const conditionMap: { [name in ConditionKey]: boolean } = internalConditionList.reduce(
        (previousValue, currentValue, currentIndex) => {
            return { ...previousValue, [`${currentValue.channelName}-${currentIndex}`]: false };
        },
        {} as { [name in ConditionKey]: boolean },
    );

    // set up handlers
    const handlers: {
        executors: VoidFunction[];
        destroyers: VoidFunction[];
    } = {
        executors: [],
        destroyers: [],
    };

    // previous value of the evaluation context
    let previous: boolean = false;

    // set up the evaluation runner
    const runEvaluation = (ignorePreviousEvaluationValue: boolean) => {
        // current value of the evaluation context
        const current = Object.values(conditionMap).every((v) => v);

        if (ignorePreviousEvaluationValue && current) {
            // the condition that requested the evaluation requires
            // a reload, ignoring the previous value

            for (const f of handlers.destroyers) f();
            for (const f of handlers.executors) f();
        } else if (!previous && current) {
            // the evaluation result has newly become true, so the
            // executors have to be run

            // set the previous value to the current one first, to
            // avoid "Max call stack exceeded" errors
            previous = current;

            for (const f of handlers.executors) f();
        } else if (previous && !current) {
            // the evaluation result has now become false, so the
            // destroyers have to be run

            // set the previous value to the current one first, to
            // avoid "Max call stack exceeded" errors
            previous = current;

            for (const f of handlers.destroyers) f();
        }
    };

    // subscribe to the channels required by the conditions
    for (let i = 0; i < internalConditionList.length; i++) {
        const condition = internalConditionList[i];
        subscribeTo(condition.channelName, (value) => {
            // only run the evaluation if the current condition actually requires it
            if (condition.needsEvaluation(value)) {
                conditionMap[`${condition.channelName}-${i}`] = condition.evaluateCondition(value);
                runEvaluation(!!condition.requiresContextReloadOnTruthfulEvaluation);
            }
        });
    }

    return {
        execute(handler: VoidFunction) {
            handlers.executors.push(handler);
            return this;
        },
        otherwise(handler: VoidFunction) {
            handlers.destroyers.push(handler);
            return this;
        },
    };
}
