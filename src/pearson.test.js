import { describe, test, expect, bench } from 'vitest'
import { pearson, classic, next } from './pearson.js'
import testData from './test-data/data.js'

const headerLength = 'T1xxyyzz'.length;
const offset = 3;
const mockedPearsonArgs = [
    [2,"abc"],
    [1,"xyz"],
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
    [1,[97,98,99]]
]

function profile(fn,...args) {
    const start = performance.now();
    fn(...args);
    const end = performance.now();
    return end - start;
};

export function closure(fn) {
    const arglist = mockedPearsonArgs;
    let result;
    for (const args of arglist) {
        try {
            result = fn(...args)
        } catch(e) {throw(e)}
    }
    return result;
}

describe('pearson behaviour', () => {
    test(`pearson of 'abc' and 'xyz' should be different`, () => {
        const enc = new TextEncoder();
        expect(pearson(1,enc.encode("abc"))).not.toEqual(pearson(1,enc.encode("xyz")))
    })

    test(`pearson works with arrays`, () => {
        const a = [2,[97,98,99]];
        expect( () => 
            pearson(a[0],a[1])
        ).to.not.throw();
        expect(pearson(a[0],a[1])).toBe(119);
    })

    test(`pearson work with strings`, () => {
        const a = [2,"abc"];
        expect( () => 
            pearson(a[0],a[1])
        ).to.not.throw();
        expect(pearson(a[0],a[1])).toBe(119);
    })

    test(`pearson throws when input is more than a triplet`, () => {
        expect(() => pearson(1,"Bob")).to.not.throw();
        expect(() => pearson(1,"Jane")).to.throw();
    })

    test(`pearson throws when input is less than a triplet`, () => {
        expect(() => pearson(1,"Bob")).to.not.throw();
        expect(() => pearson(1,"Jo")).to.throw();
    })

    test(`pearson benchmarking closure works`, () => {
        expect(() => closure(next)).to.not.throw();
        expect(closure(next)).toBe(14);
    })
})



describe('pearson.next', () => {
    test(`pearson next and classic should be the same`, () => {
        const enc = new TextEncoder();
        const start = 282;
        for (const e of testData) {
            const win1 = e.text.substring(start,start+offset);
            const tri1 = enc.encode(win1);
            const win2 = e.text.substring(start,start+offset);
            const tri2 = enc.encode(win2);
            // console.log(win1);
            // console.log(tri1);
            // console.log(win2);
            // console.log(tri2);
            const originalArr = classic(1,tri1);
            const refactoredArr = next(1,tri2);
            expect(originalArr).toBe(refactoredArr);
            const originalStr = classic(1,win1);
            const refactoredStr = next(1,win2);
            expect(originalStr).toBe(refactoredStr)
        }
    })
    
    test.skip.each(mockedPearsonArgs)
    ('next should be faster than classic (salt:%i,tri:%s)', (salt,s) => {
        expect(
            profile(next,salt,s),
            `each: ${salt}, ${s}`
        ).to.be.below(
            profile(classic,salt,s)
        )
    })    
})

describe('pearson data processing', () => {
    test(`svg1 checksum pearson(0,32,103,0) step`, () => {
        expect(classic(0,[32,103,0])).toBe(220)
    })

    test(`pearson(2,101,100,99) = 90`, () => {
        expect(
            classic(2,[101,100,99])
        ).toBe(90);
    })
})