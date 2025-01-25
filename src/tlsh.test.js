import { expect, test, describe } from 'vitest';
import { hash, minSize }  from './tlsh.js';
import testData from './test-data/data.js';

const t1HeaderLen = 'T1xxyyzz'.length;
const oldHeaderLen = 'xxyyzz'.length;
const bodyLen = 72 - t1HeaderLen;
const oldDigestLen = oldHeaderLen + bodyLen;

describe(`Hashes test data correctly`, () => {
    test.each(testData)
    (`digest body`, (d) => {
        const testDigestBody = d.tlsh.slice(-bodyLen).toLowerCase();
        const outDigestBody  = hash(d.text).slice(-bodyLen).toLowerCase();
        expect(
            outDigestBody
        ).toBe(testDigestBody);
    })
    test.skip.each(testData)
    (`checksum`, (d) => {
        expect(
            hash(d.text).slice(-oldDigestLen).slice(0,2).toLowerCase()
        ).toBe(
            d.tlsh.slice(-oldDigestLen).slice(0,2).toLowerCase()
        )
    });
    test.todo(`whole header`)
    test.skip.each(testData)
    ('whole hash', (d) => {
        expect(
            hash(d.text).slice(-oldDigestLen).toLowerCase()
        ).toBe(
            d.tlsh.slice(-oldDigestLen).toLowerCase()
        );
    });    
})

describe(`Error checking`, () => {
    test(`Throws error if input is smaller than ${minSize} bytes`, () => {
        expect(() => hash("a".repeat(minSize-1))).to.throw('byte length too small');
    });
    
    test(`Does not throw error if input is equal or greater than ${minSize} bytes`, () => {
        expect(() => hash("a".repeat(minSize))).to.not.throw();
        expect(() => hash("a".repeat(minSize+1))).to.not.throw();
        expect(() => hash("a".repeat(minSize-1))).to.throw();
    })
})
