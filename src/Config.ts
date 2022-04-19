import { AutopublisherSource, AutopublisherTarget } from "./interfaces";

export interface Config {
    contexts: ContextConfig<any, any>[]
}

export interface ContextConfig<S, T> {
    dir: string,
    source: AutopublisherSource<S>,
    transformation: (s: S) => T,
    target: AutopublisherTarget<T>,
}