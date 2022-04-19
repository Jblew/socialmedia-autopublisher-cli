import { Config } from "./Config";
import { Autopublisher } from "./interfaces";

export function autopublisher(configFn: () => Config): Autopublisher {
    return {
        async fetch() {
            throw new Error("Not implemented yet")
        },
        async prepare() {
            throw new Error("Not implemented yet")
        },
        async publish() {
            throw new Error("Not implemented yet")
        }
    }
}

export * from "./interfaces";
export * from "./Config";
