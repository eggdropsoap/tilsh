import { expect, describe, it } from 'vitest'
import { CppTestData } from './data'

describe('Test data class', () => {
    it('instantiates file data', () => {
        const data = new CppTestData;
        expect(data).toBeTypeOf('object');
        expect(data).to.have.nested.property('[0].name');
        console.log(data[data.length-1])
    })
    it('returns a data object instead of itself', () => {
        const data = new CppTestData();
        expect(data).to.not.be.an.instanceof(CppTestData);
    })
    it('returns deeply identical objects with different instances', () => {
        const data1 = new CppTestData();
        const data2 = new CppTestData();
        expect(data1).to.deep.equal(data2);
    })
    it('accepts a limit option', () => {
        const data = new CppTestData({limit: 3});
        expect(data.length).toBe(3);
    })
    it('accepts a subset option', () => {
        const data = new CppTestData({subset: 'ascii'});
        const full_list_length = CppTestData.length;
        expect(data.length).to.be.lessThan(full_list_length);
    })
    it.each([
        'ascii',
        'simple-ascii',
        'clean-ascii',
        'non-ascii',
        'small',
    ])
    ("has the subset option: %s", (opt) => {
        const data = new CppTestData({subset:opt});
        const full_list_length = CppTestData.length;
        expect(data.length).to.be.lessThan(full_list_length);
    })
    it('combines subset and limit options', () => {
        const data1 = new CppTestData({subset:'small',limit:1});
        const data2 = new CppTestData({subset:'small',limit:20});
        expect(data1.length).toBe(1);
        expect(data2.length).toBe(2);
    })
    it('returns full list for unknown subset option', () => {
        const data = new CppTestData({subset:'not-a-known-subset'});
        const full_list_length = CppTestData.length;
        expect(data.length).toBe(full_list_length);
    })
})