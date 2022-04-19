import { ContextConfig } from "@/Config";
import { Article, Autopublisher } from "@/interfaces";
import { assign, createMachine, DoneInvokeEvent, interpret, State } from "xstate";
import * as fs from "fs"
import { awaitManyMachinesDone } from "@/util";

export class AutopublisherXState implements Autopublisher {
    private interpreters: ReturnType<typeof this.interpretMachine>[];

    constructor(private config: ContextConfig) {
    }

    async fetch() {
        this.initialize();
        await this.fetchNewArticlesStartMachines();
        await this.awaitAllMachines();
    }

    async prepare() {
        this.initialize();
        this.sendToAllMachines('PREPARE');
        await this.awaitAllMachines();
    }

    async publish() {
        this.initialize();
        this.sendToAllMachines('PUBLISH');
        await this.awaitAllMachines();
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
                    on: {
                        PREPARE: 'preparing'
                    }
                },
                preparing: {
                    entry: 'clearError',
                    invoke: {
                        src: 'prepare',
                        onDone: { target: 'prepared', actions: ['setPrepared'] },
                        onError: { target: 'preparingError', actions: ['setError'] }
                    }
                },
                preparingError: {
                    entry: ['logError'],
                    on: { always: 'fetched' }
                },
                prepared: {
                    on: {
                        PUBLISH: 'publishing',
                        always: { actions: ['save'], target: 'saved' }
                    }
                },
                publishing: {
                    entry: 'clearError',
                    invoke: {
                        src: 'publish',
                        onDone: { target: 'published', actions: ['setPrepareResult'] },
                        onError: { target: 'publishingError', actions: ['setError'] }
                    }
                },
                publishingError: {
                    entry: ['logError'],
                    on: { always: 'prepared' }
                },
                published: {},
                saved: {
                    type: 'final'
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
            const interpreter = this.interpretMachine(this.createMachine(article))
            interpreter.start()
            interpreter.send('')
            this.interpreters.push(interpreter)
        }
    }

    private startNewMachineForArticle(article: Article) {
        const interpreter = this.interpretMachine(this.createMachine(article))
        interpreter.start()
        interpreter.send('FETCH')
        return interpreter
    }

    private sendToAllMachines(event: string) {
        this.interpreters.forEach(interpreter => interpreter.send(event))
    }

    private async awaitAllMachines() {
        await awaitManyMachinesDone(this.interpreters)
    }

    private rehydrateMachine(stateDehydrated: any) {
        const state: any = State.create(stateDehydrated);
        const interpreter = this.interpretMachine(this.createMachine())
        return interpreter.start(state)
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