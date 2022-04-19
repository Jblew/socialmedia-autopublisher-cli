import { Article, AutopublisherSource, AutopublisherTarget } from "@/interfaces";

export class EmptySource implements AutopublisherSource<Article> {
    async fetch() {
        return []
    }
}

export class StaticSource<T extends Article> implements AutopublisherSource<T> {
    constructor(private posts: T[]) { }

    async fetch() {
        return this.posts
    }
}

type EmptyTargetIn = { title: string }
export class EmptyTarget implements AutopublisherTarget<EmptyTargetIn> {
    async publish(post: EmptyTargetIn) {
        return { ID: post.title, published: true }
    }
}