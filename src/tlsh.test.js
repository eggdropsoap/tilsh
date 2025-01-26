import { expect, test, describe } from 'vitest';
import { hash, minSize, ComplexityError, LengthError }  from './tlsh.js';

// import testData from './test-data/data.js';
import { CppTestData } from './test-data/data.js';

const limit = 3;
const subset = 'ascii';
const testData = CppTestData.length > limit ? new CppTestData({subset: subset, limit: limit}) : new CppTestData();


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
    test.each(testData)
    ('whole hash ($name)', (d) => {
        expect(
            hash(d.text).toLowerCase()
        ).toBe(
            d.tlsh.toLowerCase()
        );
    });    
})

describe(`Error checking`, () => {
    test(`Throws a LengthError if input is smaller than ${minSize} bytes`, () => {
        expect(() => hash("a".repeat(minSize-1))).to.throw(LengthError);
    });
    test(`Does not throw LengthError if input is equal or greater than ${minSize} bytes`, () => {
        expect(() => hash("a".repeat(minSize  ))).to.not.throw(LengthError);
        expect(() => hash("a".repeat(minSize+1))).to.not.throw(LengthError);
    })
    
    test(`Throws ComplexityError if input is simple`, () => {
        expect(() => hash("a".repeat(minSize  ))).to.throw(ComplexityError);
        expect(() => hash("a".repeat(minSize+1))).to.throw(ComplexityError);
    })
})
