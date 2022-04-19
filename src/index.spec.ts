import * as fs from "fs";
import { EmptySource, EmptyTarget, StaticSource } from "./plugins/mocks";
import { autopublisher, ContextConfig } from "./index";
import { expect } from "chai";
import sinon, { SinonSpy } from "sinon";

describe("autopublisher.fetch", () => {
    it("Calls fetch of source from each context", async () => {
        const contexts = [makeDummyContext(), makeDummyContext()];
        contexts.forEach(context => context.source.fetch = sinon.spy(context.source.fetch))
        const a = autopublisher(() => ({ contexts, }))
        await a.fetch();
        contexts.forEach(context => expect((context.source.fetch as SinonSpy).callCount).to.be.eq(1))
    })

    it("Saves per post state in the context directory", async () => {
        const context = makeDummyContext();
        const ID = `post-${Math.random()}`;
        context.source = new StaticSource([{ ID, title: `Article ${ID}` }])
        const a = autopublisher(() => ({ contexts: [context], }))
        await a.fetch();
        expect(fs.existsSync(`${context.dir}/${ID}.json`))
    })
})

describe("autopublisher.prepare", () => {
    it("Calls prepare function of each context", async () => {
        const contexts = [makeDummyContext(), makeDummyContext()];
        contexts.forEach(context => context.prepare = sinon.spy(context.prepare))
        const a = autopublisher(() => ({ contexts, }))
        await a.prepare();
        contexts.forEach(context => expect((context.prepare as SinonSpy).callCount).to.be.eq(1))
    })
})

describe("autopublisher.publish", () => {
    it("Calls publish function of each context", async () => {
        const contexts = [makeDummyContext(), makeDummyContext()];
        contexts.forEach(context => context.target.publish = sinon.spy(context.target.publish))
        const a = autopublisher(() => ({ contexts, }))
        await a.prepare();
        contexts.forEach(context => expect((context.target.publish as SinonSpy).callCount).to.be.eq(1))
    })
})

describe("autopublisher flow", () => {
    it("Full autopublisher flow", async () => {
        const context = makeDummyContext();
        const ID = `post-${Math.random()}`;
        context.source = new StaticSource([{ ID, title: `Article ${ID}` }])
        const getState = () => JSON.parse(fs.readFileSync(`${context.dir}/${ID}.json`, "utf-8"))
        const a = autopublisher(() => ({ contexts: [context], }))
        await a.fetch();
        expect(getState().state.name).to.match(/^fetched/)
        await a.prepare();
        expect(getState().state.name).to.match(/^prepared/)
        await a.publish()
        expect(getState().state.name).to.match(/^published/)
    })
})

function makeDummyContext(): ContextConfig<any, any, any> {
    const dir = fs.mkdtempSync(`.testtemp/socialmedia-autopublisher-test-${new Date().toISOString()}`);
    return {
        dir,
        source: new EmptySource(),
        prepare: async () => { },
        transformation: (s) => ({ ...s }),
        target: new EmptyTarget()
    }
}