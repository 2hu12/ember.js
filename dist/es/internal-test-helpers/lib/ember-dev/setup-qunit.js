import { getDebugFunction, setDebugFunction } from '@ember/debug';
import { DEBUG } from '@glimmer/env';
import { setupAssertionHelpers } from './assertion';
import { setupContainersCheck } from './containers';
import { setupDeprecationHelpers } from './deprecation';
import { setupNamespacesCheck } from './namespaces';
import { setupRunLoopCheck } from './run-loop';
import { setupWarningHelpers } from './warning';
export default function setupQUnit({ runningProdBuild }) {
    let env = {
        runningProdBuild,
        getDebugFunction,
        setDebugFunction,
    };
    let originalModule = QUnit.module;
    QUnit.module = function (name, callback) {
        return originalModule(name, function (hooks) {
            setupContainersCheck(hooks);
            setupNamespacesCheck(hooks);
            setupRunLoopCheck(hooks);
            setupAssertionHelpers(hooks, env);
            setupDeprecationHelpers(hooks, env);
            setupWarningHelpers(hooks, env);
            callback(hooks);
        });
    };
    QUnit.assert.rejects = async function (promise, expected, message) {
        let threw = false;
        try {
            await promise;
        }
        catch (e) {
            threw = true;
            QUnit.assert.throws(() => {
                throw e;
            }, expected, message);
        }
        if (!threw) {
            QUnit.assert.ok(false, `expected an error to be thrown: ${expected}`);
        }
    };
    QUnit.assert.throwsAssertion = function (block, expected, message) {
        if (!DEBUG) {
            QUnit.assert.ok(true, 'Assertions disabled in production builds.');
            return;
        }
        return QUnit.assert.throws(block, expected, message);
    };
    QUnit.assert.rejectsAssertion = async function (promise, expected, message) {
        if (!DEBUG) {
            QUnit.assert.ok(true, 'Assertions disabled in production builds.');
            return promise;
        }
        await QUnit.assert.rejects(promise, expected, message);
    };
}
