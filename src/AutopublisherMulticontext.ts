import { Config, ContextConfig } from "./Config";
import { Autopublisher } from "./interfaces";

export class AutopublisherMulticontext implements Autopublisher {
    private publishers: [ContextConfig, Autopublisher][];

    constructor(config: Config, publisherFactory: (ctx: ContextConfig) => Autopublisher) {
        this.publishers = config.contexts.map(ctx => [ctx, publisherFactory(ctx)])
    }

    async fetch() {
        for (const [ctx, publisher] of this.publishers) {
            try {
                await publisher.fetch();
            } catch (err) {
                console.error(`Error in autopublisher.fetch of context ${ctx.dir}`)
            }
        }
    }

    async prepare() {
        for (const [ctx, publisher] of this.publishers) {
            try {
                await publisher.prepare();
            } catch (err) {
                console.error(`Error in autopublisher.prepare of context ${ctx.dir}`)
            }
        }
    }

    async publish() {
        for (const [ctx, publisher] of this.publishers) {
            try {
                await publisher.publish();
            } catch (err) {
                console.error(`Error in autopublisher.publish of context ${ctx.dir}`)
            }
        }
    }
}