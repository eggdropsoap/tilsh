import { bench } from 'vitest';
import { next, classic } from './pearson.js';
import { closure } from './pearson.test.js';

const mockedPearsonArgs = [
    [1,"abc"],
    [2,"xyz"],
    [3,"foo"],
    [5,"bar"],
    [5,"baz"],
    [7,"Ali"],
    [11,"Bob"],
    [13,"Jan"],
    [17,"abc"],
    [19,"xyz"],
    [23,"foo"],
    [29,"bar"],
    [1,"abc"],
    [1,[97,98,99]],
    // [1,"a"]
]

const benchargs = {
    warmupIterations: 1000,
    iterations: 1000,
    warmupTime: 0,
    // throws: false
}

bench(`baseline`,  () => {
    const arglist = mockedPearsonArgs;
    let result;
    for (const args of arglist) {
        try {
            result = next(...args)
        } catch(e) {}
    }
    return result;
})

bench(`classic`,   () => closure(classic), benchargs);
bench(`next`,      () => closure(next),    benchargs);
bench(`classic2`,  () => closure(classic), benchargs);
bench(`next2`,     () => closure(next),    benchargs);
bench(`classic3`,  () => closure(classic), benchargs);
bench(`next3`,     () => closure(next),    benchargs);
bench(`next-C`,    () => closure(next),    benchargs);
bench(`classic-C`, () => closure(classic), benchargs);

