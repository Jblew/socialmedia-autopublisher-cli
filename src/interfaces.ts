export interface Autopublisher {
    fetch(): Promise<void>
    prepare(): Promise<void>
    publish(): Promise<void>
}

export interface Article {
    ID: string,
    title: string,
}

export interface AutopublisherSource<T extends Article> {
    fetch(): Promise<T[]>
}

export interface AutopublisherTarget<T, RESPONSE = any> {
    publish(t: T): Promise<RESPONSE>
}