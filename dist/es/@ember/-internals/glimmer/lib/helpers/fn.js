import { assert } from '@ember/debug';
import { DEBUG } from '@glimmer/env';
import { InternalHelperReference, INVOKE } from '../utils/references';
import buildUntouchableThis from '../utils/untouchable-this';
const context = buildUntouchableThis('`fn` helper');
function fnHelper({ positional }) {
    let callbackRef = positional.at(0);
    if (DEBUG && typeof callbackRef[INVOKE] !== 'function') {
        let callback = callbackRef.value();
        assert(`You must pass a function as the \`fn\` helpers first argument, you passed ${callback}`, typeof callback === 'function');
    }
    return (...invocationArgs) => {
        let [fn, ...args] = positional.value();
        if (typeof callbackRef[INVOKE] === 'function') {
            // references with the INVOKE symbol expect the function behind
            // the symbol to be bound to the reference
            return callbackRef[INVOKE](...args, ...invocationArgs);
        }
        else {
            return fn['call'](context, ...args, ...invocationArgs);
        }
    };
}
export default function (_vm, args) {
    return new InternalHelperReference(fnHelper, args.capture());
}
