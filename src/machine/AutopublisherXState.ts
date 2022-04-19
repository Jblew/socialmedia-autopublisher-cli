import { ContextConfig } from "@/Config";
import { Article, Autopublisher } from "@/interfaces";
import { AnyInterpreter, assign, createMachine, DoneInvokeEvent, interpret, State } from "xstate";
import * as fs from "fs"
import { awaitManyMachinesDone, awaitManyMachinesState } from "@/util";

export class AutopublisherXState implements Autopublisher {
    private interpreters: ReturnType<typeof this.interpretMachine>[];

    constructor(private config: ContextConfig) {
    }

    async fetch() {
        this.initialize();
        await this.fetchNewArticlesStartMachines();
        this.sendToAllMachines('FETCH');
        await this.finalize();
    }

    async prepare() {
        this.initialize();
        this.sendToAllMachines('PREPARE');
        await this.finalize();
    }

    async publish() {
        this.initialize();
        this.sendToAllMachines('PUBLISH');
        await this.finalize();
    }

    private createMachine(article?: Article) {
        const context = {
            article: article || null,
            prepared: null as any,
            publishResult: {} as any,
            error: null as any,
        }
        return createMachine({
            initial: 'fetched',
            context,
            states: {
                fetched: {
                    on: { PREPARE: 'preparing', FETCH: 'finished.fetched' }
                },
                preparing: {
                    entry: 'clearError',
                    invoke: {
                        src: 'prepare',
                        onDone: { target: 'finished.prepared', actions: ['setPrepared'] },
                        onError: { target: 'preparingError', actions: ['setError'] }
                    }
                },
                preparingError: {
                    entry: ['logError'],
                    on: { always: 'finished.fetched' }
                },
                prepared: {
                    on: { PUBLISH: 'publishing' }
                },
                publishing: {
                    entry: 'clearError',
                    invoke: {
                        src: 'publish',
                        onDone: { target: 'finished.published', actions: ['setPrepareResult'] },
                        onError: { target: 'publishingError', actions: ['setError'] }
                    }
                },
                publishingError: {
                    entry: ['logError'],
                    on: { always: 'prepared' }
                },
                published: {},
                finished: {
                    states: {
                        fetched: {
                            on: { REHYDRATE: 'fetched' }
                        },
                        prepared: {
                            on: { REHYDRATE: 'prepared' }
                        },
                        published: { type: 'final' }
                    }
                }
            }
        }, {
            actions: {
                logError: (_, evt: DoneInvokeEvent<any>) => console.error(evt.data),
                clearError: assign<typeof context>({ error: () => null }),
                setError: assign<typeof context>({ error: (_: any, evt: DoneInvokeEvent<any>) => evt.data }),
                setPrepared: assign<typeof context>({ prepared: (_: any, evt: DoneInvokeEvent<any>) => evt.data }),
                setPublishResult: assign<typeof context>({ publishResult: (_: any, evt: DoneInvokeEvent<any>) => evt.data }),
            }
        })
    }

    private interpretMachine(machine: ReturnType<typeof this.createMachine>) {
        return interpret(machine.withConfig({
            services: {
                prepare: (ctx) => this.config.prepare(ctx.article),
                publish: (ctx) => this.config.target.publish(ctx.prepared),
            }
        })).onTransition((s) => console.log('TRANSITION', s.value)).onEvent((evt) => console.log('   EVENT', evt.type))
    }

    private initialize() {
        this.interpreters = this.startAllExistingMachines()
    }

    private startAllExistingMachines() {
        const machines: ReturnType<typeof this.rehydrateMachine>[] = []
        for (const stateFilePath of this.getStateFiles()) {
            const stateDehydrated = JSON.parse(fs.readFileSync(stateFilePath, "utf-8"));
            machines.push(this.rehydrateMachine(stateDehydrated));
        }
        return machines;
    }

    private async fetchNewArticlesStartMachines() {
        const articles = await this.config.source.fetch();
        for (const article of articles) {
            if (!this.existsMachineForArticle(article)) {
                this.interpreters.push(this.startNewMachineForArticle(article))
            }
        }
    }

    private startNewMachineForArticle(article: Article) {
        const interpreter = this.interpretMachine(this.createMachine(article))
        interpreter.start()
        return interpreter
    }

    private sendToAllMachines(event: string) {
        this.interpreters.forEach(interpreter => interpreter.send(event))
    }

    private async finalize() {
        await this.awaitAllMachinesFinished()
        this.saveInterpreters();
    }

    private async awaitAllMachinesFinished() {
        await awaitManyMachinesState(this.interpreters, state => state.matches('finished'))
    }

    private saveInterpreters() {
        for (const interpreter of this.interpreters) {
            const hydrated = this.hydrateInterpreter(interpreter)
            const path = `${this.config.dir}/${interpreter.state.context.article?.ID}.state.json`
            fs.writeFileSync(path, JSON.stringify(hydrated, undefined, 2))
        }
    }

    private rehydrateMachine(stateDehydrated: any) {
        const state: any = State.create(stateDehydrated);
        const interpreter = this.interpretMachine(this.createMachine())
        interpreter.start(state)
        interpreter.send('REHYDRATE')
        return interpreter
    }

    private hydrateInterpreter(interpreter: AnyInterpreter) {
        interpreter.stop()
        return interpreter.state
    }

    private existsMachineForArticle(article: Article) {
        for (const interpreter of this.interpreters) {
            if (interpreter.state.context.article?.ID == article.ID) {
                return true;
            }
        }
        return false;
    }

    private getStateFiles() {
        const files = fs.readdirSync(this.config.dir);
        return files.filter(filename => filename.match(/\.state\.json$/)).map(filename => `${this.config.dir}/${filename}`)
    }
}