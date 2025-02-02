import { expect, test, describe } from 'vitest';
import { TLSH, ComplexityError, LengthError, InvalidOptionsError, NotImplementedError }  from './tlsh.js';
import { CppTestData, SVGTestData } from './test-data/data.js';

let limit, subset;
limit = 3;
subset = 'ascii';
const testData = CppTestData.length > limit ? new CppTestData({subset: subset, limit: limit}) : new CppTestData();


const t1HeaderLen = 'T1xxyyzz'.length;
const oldHeaderLen = 'xxyyzz'.length;
const bodyLen = 72 - t1HeaderLen;
const oldDigestLen = oldHeaderLen + bodyLen;

const tlsh = new TLSH();
const minSize = tlsh.minSize;


describe(`Hashes test data correctly`, () => {
    test.each(testData)
    ('digest body ($name)', (d) => {
        const testDigestBody = d.lsh.slice(-bodyLen).toLowerCase();
        const outDigestBody  = tlsh.hash(d.text).slice(-bodyLen).toLowerCase();
        expect(
            outDigestBody
        ).toBe(testDigestBody);
    })
    test.each(testData)
    (`checksum ($name)`, (d) => {
        expect(
            tlsh.hash(d.text).slice(-oldDigestLen).slice(0,2).toLowerCase()
        ).toBe(
            d.lsh.slice(-oldDigestLen).slice(0,2).toLowerCase()
        )
    });
    test.each(testData)
    ('length log byte ($name)', (d) => {
        expect(
            tlsh.hash(d.text).slice(-oldDigestLen).slice(2,4).toLowerCase()
        ).toBe(
            d.lsh.slice(-oldDigestLen).slice(2,4).toLowerCase()
        )
    });
    test.each(testData)
    (`quartiles byte ($name)`, (d) => {
        expect(
            tlsh.hash(d.text).slice(-oldDigestLen).slice(4,6).toLowerCase()
        ).toBe(
            d.lsh.slice(-oldDigestLen).slice(4,6).toLowerCase()
        )
    });
    test.each(testData)
    (`whole header ($name)`, (d) => {
        expect(
            tlsh.hash(d.text).slice(-oldDigestLen).slice(0,6).toLowerCase()
        ).toBe(
            d.lsh.slice(-oldDigestLen).slice(0,6).toLowerCase()
        )
    });
    test.each(testData)
    ('whole digest ($name)', (d) => {
        expect(
            tlsh.hash(d.text).slice(-oldDigestLen).toLowerCase()
        ).toBe(
            d.lsh.slice(-oldDigestLen).toLowerCase()
        );
    });    
    test.each(testData)
    ('whole hash ($name)', (d) => {
        expect(
            tlsh.hash(d.text).toLowerCase()
        ).toBe(
            d.lsh.toLowerCase()
        );
    });
})

describe('Configuration options', () => {
    const data1 = SVGTestData[0];

    test('supports hashes without version marker', () => {
        const t = new TLSH({versionmark: false});
        expect(
            t.hash(data1.text).slice(-oldDigestLen).toLowerCase()
        ).toBe(
            data1.lsh.slice(-oldDigestLen).toLowerCase()
        );
    })

    const oldstyleHash = new TLSH({oldstyle: true}).hash(data1.text);
    test('oldstyle hash is 70 characters', () => {
        expect(oldstyleHash).toBeTypeOf('string');
        expect(oldstyleHash.length).toBe(70);
    })
    test('oldstyle hash is correct', () => {
        expect(oldstyleHash).toBe(data1.lsh.slice(-oldDigestLen));
    })
    test('oldstyle reports min input length of 256', () => {
        const t = new TLSH({oldstyle:true});
        expect(t.minSize).toBe(256);
    })
    test('oldstyle enforces minimum input length of 256', () => {
        const input = SVGTestData[0].text.substring(0,255);
        expect(
            () => {
                new TLSH({oldstyle: true}).hash(input)
            }
        ).to.throw(LengthError);
    })
})

describe(`Error checking`, () => {
    test(`Throws a LengthError if input is smaller than minSize(=${minSize}) bytes`, () => {
        expect(() => tlsh.hash("a".repeat(minSize-1))).to.throw(LengthError);
    });
    test(`Does not throw LengthError if input is equal or greater than minSize(=${minSize}) bytes`, () => {
        expect(() => tlsh.hash("a".repeat(minSize  ))).to.not.throw(LengthError);
        expect(() => tlsh.hash("a".repeat(minSize+1))).to.not.throw(LengthError);
    })
    
    test(`Throws ComplexityError if input is simple`, () => {
        expect(() => tlsh.hash("a".repeat(minSize  ))).to.throw(ComplexityError);
        expect(() => tlsh.hash("a".repeat(minSize+1))).to.throw(ComplexityError);
    })

    test.each([
        {hashbytes: 40},
        {versionmark: 2},
        {hashbytes: 40, versionmark: 2},
    ])
    ('Throws InvalidOptionsError for supported options with invalid values (%s)', (opts) => {
        expect(() => {new TLSH(opts)}).to.throw(InvalidOptionsError);
    })
    test('InvalidOptionsError reports multiple invalid options values', () => {
        expect(() => {new TLSH({hashbytes: 40, versionmark: 2})}).to.throw(/(?=.*hashbytes)(?=.*versionmark)/);
    })

    test.each(['checksum','windowsize','buckets48','version'])
    (`Throws NotImplementedError for unimplemented constructor option (%s)`, (opt) => {
        expect( () => {
            if (TLSH.options.supported.includes(opt)) throw new Error(`${opt} option is implemented`)
        }).to.not.throw();

        const opts = {};
        opts[opt] = 'foo';
        expect(
            (() => { new TLSH(opts) })
        ).to.throw(NotImplementedError);
    })
    test(`NotImplementedError reports multiple unimplemented constructor options`, () => {
        const opts = {barracudas: -1, puffins: -1};
        expect(
            (() => { new TLSH(opts) })
        ).to.throw(NotImplementedError);
        expect(
            (() => { new TLSH(opts) })
        ).to.throw(/(?=.*barracudas)(?=.*puffins)/);
    })
})
