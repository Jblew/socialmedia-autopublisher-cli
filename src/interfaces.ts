export interface Autopublisher {
    fetch(): Promise<void>
    prepare(): Promise<void>
    publish(): Promise<void>
}

export interface AutopublisherSource<T> {

}

export interface AutopublisherTarget<T> {

}