import { Interpreter } from "xstate";

export type AnyInterpreter = Interpreter<any, any, any, any, any>

export function awaitMachineDone(interpreter: AnyInterpreter): Promise<void> {
    return new Promise((resolve) => {
        interpreter.onDone(() => resolve())
    })
}

export async function awaitManyMachinesDone(interpreters: AnyInterpreter[]) {
    await Promise.all(interpreters.map(awaitMachineDone))
}