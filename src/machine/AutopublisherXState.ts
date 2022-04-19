import { ContextConfig } from "@/Config";
import { Article, Autopublisher } from "@/interfaces";
import { createMachine, interpret, State } from "xstate";
import * as fs from "fs"

export class AutopublisherXState implements Autopublisher {
    private interpreters: ReturnType<typeof this.interpretMachine>[];

    constructor(private config: ContextConfig) {
    }

    async fetch() {
        await this.initialize();
        await this.fetchNewArticlesStartMachines();
        await this.awaitAllMachines();
    }

    async prepare() {
        await this.initialize();
        this.sendToAllMachines('PREPARE');
        await this.awaitAllMachines();
    }

    async publish() {
        await this.initialize();
        this.sendToAllMachines('PUBLISH');
        await this.awaitAllMachines();
    }

    private async initialize() {
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
            if (this.existsMachineForArticle(article)) {
                continue;
            }
            const interpreter = this.interpretMachine(this.createMachine(article))
            interpreter.start()
            this.interpreters.push(interpreter)
        }
    }

    private createMachine(article?: Article) {
        return createMachine({
            initial: 'unfetched',
            context: {
                article: article || undefined
            }
        })
    }

    private interpretMachine(machine: ReturnType<typeof this.createMachine>) {
        return interpret(machine)
    }

    private sendToAllMachines(event: string) {
        this.interpreters.forEach(interpreter => interpreter.send(event))
    }

    private async awaitAllMachines() {
        await Promise.all(this.interpreters.map(interpreter => async () => await interpreter.awaitFinalState()))
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