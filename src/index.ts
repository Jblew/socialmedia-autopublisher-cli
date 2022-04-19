import { AutopublisherXState } from "./machine";
import { Config } from "./Config";
import { Autopublisher } from "./interfaces";
import { AutopublisherMulticontext } from "./AutopublisherMulticontext";

export function autopublisher(configFn: () => Config): Autopublisher {
    return new AutopublisherMulticontext(configFn(), (ctx) => new AutopublisherXState(ctx))
}

export * from "./interfaces";
export * from "./Config";
