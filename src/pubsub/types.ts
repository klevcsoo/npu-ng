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
    /**
     * The name of the channel that the condition is applicable to.
     */
    channelName: C;

    /**
     * If set to `true`, the context is forced to run every executor function
     * when this condition is evaluated truthfully, even if the combined result
     * of all the context conditions of the previous evaluation is the same as
     * the current one.
     *
     * This does not have an affect if the condition evaluates to false, in this
     * case, the default behaviour will be put into effect.
     *
     * Useful for conditions that are meant to trigger a context reload,
     * event when their own individual evaluation result doesn't change.
     *
     * **Be careful when using this options, as extended use can hurt performance,
     * since the context has to run every destroyer and executor every time this
     * condition is evaluated truthfully!**
     */
    requiresContextReloadOnTruthfulEvaluation?: boolean;

    /**
     * When the channel publishes an update, this function is run before the
     * `evaluateCondition` function, to determine whether we even need to
     * reevaluate the conditions.
     * When this function returns true, the condition are reevaluated (by
     * running the `evaluateCondition` function).
     *
     * If the evaluation needs to run every time the channel publishes a new value,
     * return true.
     *
     * @param value The value that the channel has just published.
     * @returns A boolean value, that decides whether the conditions need to be evaluated.
     */
    needsEvaluation(value: ChannelPublicationTypeMap[C]): boolean;

    /**
     * Returns the value of the condition, based on the most recently published
     * value by the channel.
     *
     * Only runs of the `needsEvaluation` function returns true.
     *
     * @param value The value that the channel has just published.
     * @returns The boolean value of the condition.
     */
    evaluateCondition(value: ChannelPublicationTypeMap[C]): boolean;
}

export interface Channel<C extends ChannelName> {
    on(callback: (value: ChannelPublicationTypeMap[C]) => void): void;

    off(callback: (value: ChannelPublicationTypeMap[C]) => void): void;
}
