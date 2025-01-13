import pearson from './pearson.js';

let testMinSize;
// testSize = 20;
const defaultMinInputSize = 50;         // new style, but requires a minimum amount of randomness
const conservativeMinInputSize = 256;   // old style, for compatibility
const digestBodyLength = {  // in bytes, not hex
    original: 32,   // standard
    expanded: 64,   // now possible with 256 buckets
}
const digestByteLength = digestBodyLength.original; 
const bucketArraySize = digestByteLength * 4;

let minSize = testMinSize || conservativeMinInputSize;

const windowSize = 5;

export default function hash (s) {
    const versionMark = "T1";
    const u8array = new TextEncoder().encode(s);
    if (u8array.length < minSize) throw new Error(
        `Input byte length too small: ${u8array.length} < ${minSize}`
    );
    console.log(`u8array\n[ ${u8array} ]\n`);

    // 1. Process the byte string `u8array` with sliding window 5-wide into Pearson buckets
    const buckets = new Uint8Array(bucketArraySize);
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
    let q1, q2, q3;
    [q1,q2,q3] = quartiles(buckets);
    console.log("q1 %d, q2 %d, q3 %d",q1,q2,q3)
    console.log(buckets);

    // 3. construct the digest header
    let header = versionMark;   // stub

    // 4. construct the digest body
    const body = digestBody(buckets,q1,q2,q3);
    console.log("RESULT: %s", body);


    return `${header}${body}`;
}

function digestBody (buckets,q1,q2,q3) {
    console.log("digestBody args: ", arguments);
    const len = buckets.length;
    let accumulator = new Uint8ClampedArray(digestByteLength);
    for (let bi = 0; bi < len; bi+=4) {
        let byte = 0;
        for (let j = 0; j < 4; j++) {
            let emit = null;
            if      ( buckets[bi+j] <= q1 ) emit = 0;
            else if ( buckets[bi+j] <= q2 ) emit = 1;
            else if ( buckets[bi+j] <= q3 ) emit = 2;
            else                            emit = 3;
    
            if ( emit === null ) throw new Error("digest body construction failed to generate bits");
            byte = (byte << 2) + emit;
            console.log(`    emit: ${emit}, byte_acc: ${byte}, binary: ${byte.toString(2).padStart(8,'0')}`)
        }
        let index = Math.floor(bi/4);
        console.log(`Iternation output index: ${index}`)
        accumulator[index] = (byte);
        console.log(`loop ${bi}: byte is ${byte}, accumulator is ${accumulator} (length ${accumulator.length})`);
    }
    console.log(`final accumulator: ${accumulator.length}`)
    let hex = [];
    hex = accumulator.map((x) => x.toString(16));
    // function ToHex(a) {
    //     for
    // }
    // const result = ToHex(accumulator);
    console.log("type of accumulator: ",typeof(hex))
    return hex;
}

function selectTriplet(i,arr){
    const mask = [
        [0,1,2],    // 1. A B C
        [0,1,3],    // 2. A B   D
        [0,1,4],    // 3. A B     E
        [0,2,3],    // 4. A   C D
        [0,2,4],    // 5. A   C   E
        [0,3,4],    // 6. A     D E
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
