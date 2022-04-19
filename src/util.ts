import { Interpreter, State } from "xstate";
import { waitFor } from 'xstate/lib/waitFor';

export type AnyInterpreter = Interpreter<any, any, any, any, any>

export function awaitMachineDone(interpreter: AnyInterpreter): Promise<void> {
    return new Promise((resolve) => {
        interpreter.onDone(() => resolve())
    })
}

export async function awaitManyMachinesDone(interpreters: AnyInterpreter[]) {
    await Promise.all(interpreters.map(awaitMachineDone))
}

export async function awaitManyMachinesState(interpreters: AnyInterpreter[], matcher: (s: State<any>) => boolean) {
    await Promise.all(interpreters.map(
        interpreter => waitFor(interpreter, matcher))
    )
}