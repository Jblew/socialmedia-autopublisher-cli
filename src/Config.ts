import { Article, AutopublisherSource, AutopublisherTarget } from "./interfaces";

export interface Config {
    contexts: ContextConfig<any, any>[]
}

export interface ContextConfig<S extends Article = any, T = any> {
    dir: string,
    source: AutopublisherSource<S>,
    prepare: (s: S) => Promise<T>,
    target: AutopublisherTarget<T>,
}