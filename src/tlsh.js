import pearson from './pearson.js';

let testSize;
// testSize = 20;
const defaultSize = 50;         // new style, but requires a minimum amount of randomness
const conservativeSize = 256;   // old style, for compatibility
let minSize = testSize || conservativeSize;

const windowSize = 5;

export default function hash (s) {
    const versionMark = "T1";
    const u8array = new TextEncoder().encode(s);
    if (u8array.length < minSize) throw new Error(
        `Input byte length too small: ${u8array.length} < ${minSize}`
    );
    console.log(`u8array\n[ ${u8array} ]\n`);

    // 1. Process the byte string `u8array` with sliding window 5-wide into Pearson buckets
    const buckets = new Uint8Array(256);
    console.log(`buckets before\n[ ${buckets} ]\n`);
    for (let windowEnd = windowSize; windowEnd <= u8array.length; windowEnd++) {
        const windowStart = windowEnd - windowSize;
        console.log(`windowStart ${windowStart} of ${u8array.length} length\n`);
        for (const i of [0,1,2,3,4,5]) {
            const triplet = selectTriplet(i,u8array.slice(windowStart,windowEnd));
            console.log(`triplet: ${triplet}`)
            console.log(`pearson of triplet: ${pearson(i,triplet)}`)
            buckets[pearson(i,triplet)]++;
            console.log('\n')
        }
    }
    console.log(`buckets after\n[ ${buckets} ]\n`);

    // 2. calcualte the quartiles
    const [q1,q2,q3] = quartiles(buckets);
    console.log("q1 %d, q2 %d, q3 %d",q1,q2,q3)
    console.log(buckets);

    // 3. construct the digest header


    // 4. construct the digest body


    return result = null;
}

function selectTriplet(i,arr){
    const pattern = `
        1. A B C
        2. A B   D
        3. A B     E
        4. A   C D
        5. A   C   E
        6. A     D E
    `
    const mask = [
        [0,1,2],
        [0,1,3],
        [0,1,4],
        [0,2,3],
        [0,2,4],
        [0,3,4],
    ]
    function select(pattern,pos) {
        return mask[pattern][pos];
    }
    console.log(`select from array: ${arr}`)
    const triplet = new Uint8Array(3);
    triplet[0] = arr[0];
    triplet[1] = arr[select(i,1)];
    triplet[2] = arr[select(i,2)];

    return triplet;
}

function quartiles (bi) {
    const len = bi.length;
    if (len % 2 == 1) throw new Error('buckets array is not divisible by 2');

    const b = bi.toSorted();
    // console.log(b);
    const centre = Math.floor(len / 2);
    const centreL = Math.floor(centre / 2);
    const centreR = centre + centreL;
    console.log("Centres: %d %d %d",centreL,centre,centreR);

    const q1 = b[centreL-1] + b[centreL] / 2;
    const q2 = b[centre -1] + b[centre]  / 2;
    const q3 = b[centreR-1] + b[centreR] / 2;
    return [q1, q2, q3];
}

export { hash, minSize };
