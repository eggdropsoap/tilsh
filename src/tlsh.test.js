import { expect, test } from 'vitest';
import { hash, minSize }  from './tlsh.js';
import testData from './test-data/data.js';


test.only('hashes test data correctly', () => {
    for (const d of testData) {
        expect(hash(d.text)).toBe(d.tlsh);
    }
});

test(`Throws error if input is smaller than ${minSize} bytes`, () => {
    expect(() => hash("a".repeat(minSize-1))).to.throw('byte length too small');
});

test(`Does not throw error if input is equal or greater than ${minSize} bytes`, () => {
    expect(() => hash("a".repeat(minSize))).to.not.throw();
    expect(() => hash("a".repeat(minSize+1))).to.not.throw();
    expect(() => hash("a".repeat(minSize-1))).to.throw();
})