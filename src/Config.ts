import { Article, AutopublisherSource, AutopublisherTarget } from "./interfaces";

export interface Config {
    contexts: ContextConfig<any, any, any>[]
}

export interface ContextConfig<S extends Article = any, P = any, T = any> {
    dir: string,
    source: AutopublisherSource<S>,
    prepare: (s: S) => Promise<P>,
    transformation: (s: S) => T,
    target: AutopublisherTarget<T>,
}