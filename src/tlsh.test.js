import { expect, test, describe } from 'vitest';
import { hash, minSize }  from './tlsh.js';

// import testData from './test-data/data.js';
import { cppTestData as testData } from './test-data/data.js';

const t1HeaderLen = 'T1xxyyzz'.length;
const oldHeaderLen = 'xxyyzz'.length;
const bodyLen = 72 - t1HeaderLen;
const oldDigestLen = oldHeaderLen + bodyLen;

describe(`Hashes test data correctly`, () => {
    test.each(testData)
    ('digest body ($name)', (d) => {
        const testDigestBody = d.tlsh.slice(-bodyLen).toLowerCase();
        const outDigestBody  = hash(d.text).slice(-bodyLen).toLowerCase();
        expect(
            outDigestBody
        ).toBe(testDigestBody);
    })
    test.each(testData)
    (`checksum ($name)`, (d) => {
        expect(
            hash(d.text).slice(-oldDigestLen).slice(0,2).toLowerCase()
        ).toBe(
            d.tlsh.slice(-oldDigestLen).slice(0,2).toLowerCase()
        )
    });
    test.each(testData)
    ('length log byte ($name)', (d) => {
        expect(
            hash(d.text).slice(-oldDigestLen).slice(2,4).toLowerCase()
        ).toBe(
            d.tlsh.slice(-oldDigestLen).slice(2,4).toLowerCase()
        )
    });
    test.each(testData)
    (`quartiles byte ($name)`, (d) => {
        expect(
            hash(d.text).slice(-oldDigestLen).slice(4,6).toLowerCase()
        ).toBe(
            d.tlsh.slice(-oldDigestLen).slice(4,6).toLowerCase()
        )
    });
    test.each(testData)
    (`whole header ($name)`, (d) => {
        expect(
            hash(d.text).slice(-oldDigestLen).slice(0,6).toLowerCase()
        ).toBe(
            d.tlsh.slice(-oldDigestLen).slice(0,6).toLowerCase()
        )
    });
    test.each(testData)
    ('whole digest ($name)', (d) => {
        expect(
            hash(d.text).slice(-oldDigestLen).toLowerCase()
        ).toBe(
            d.tlsh.slice(-oldDigestLen).toLowerCase()
        );
    });    
    test.only.each(testData)
    ('whole hash ($name)', (d) => {
        expect(
            hash(d.text).toLowerCase()
        ).toBe(
            d.tlsh.toLowerCase()
        );
    });    
})

describe(`Error checking`, () => {
    test(`Throws error if input is smaller than ${minSize} bytes`, () => {
        expect(() => hash("a".repeat(minSize-1))).to.throw('byte length too small');
    });
    
    test.skip(`Does not throw error if input is equal or greater than ${minSize} bytes`, () => {
        expect(() => hash("a".repeat(minSize))).to.not.throw();
        expect(() => hash("a".repeat(minSize+1))).to.not.throw();
        expect(() => hash("a".repeat(minSize-1))).to.throw();
    })
})
