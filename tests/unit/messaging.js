import { AssertionError, expect } from 'chai'


/**
 * Creates a function that posts a message to the `worker`
 * with the specified test `name` and `data` and waits for
 * the result message posted back by the worker.
 * Makes the current test fail if the result message is an
 * object with a `message` property.
 */
export const createTestPoster = (worker) => async (name, data) => {
    const assertionError = await new Promise((resolve, reject) => {
        worker.onmessage = (event) => {
            resolve(event.data)
        }

        worker.postMessage({ name, data })
    });

    if (assertionError && assertionError['message']) {
        expect.fail(assertionError.message)
    }
}


/**
 * Creates a handler for the worker that reacts to a message
 * posted by the main thread. Calls the `tests` function having
 * the specified `name` and passes the `data` to it.
 * Posts back the test result: `undefined` if the test passed,
 * or an `AssertionError` if the test failed.
 */
export const createTestRunner = (tests) => async (event) => {
    try {
        const
            { name, data } = event.data,
            result = tests[name](data);

        if (result instanceof Promise) {
            await result
        }

        postMessage(undefined)

    } catch (assertionError) {
        postMessage(assertionError)
    }
}
