import { ContextConfig } from "@/Config";
import { Autopublisher } from "@/interfaces";

export class AutopublisherXState implements Autopublisher {
    constructor(private config: ContextConfig) {
    }

    async fetch() {
        throw new Error('Not implemented yet')
    }

    async prepare() {
        throw new Error('Not implemented yet')
    }

    async publish() {
        throw new Error('Not implemented yet')
    }
}