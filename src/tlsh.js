import pearson from './pearson.js';

const TLSHVersion = 1;
let oldStyle = false;
    // oldStyle = true;
const defaultMinInputSize = 50;         // new style, but requires a minimum amount of randomness
const conservativeMinInputSize = 256;   // old style, for compatibility
const digestBodyLength = {  // in bytes, not hex
    original: 32,   // standard
    expanded: 64,   // now possible with 256 buckets
}
const digestByteLength = digestBodyLength.original;
const bucketArraySize = digestByteLength * 4;
// const bucketArraySize = 256;     // not yet implemented in reference spec

const minSize = oldStyle ? conservativeMinInputSize : defaultMinInputSize;

const windowSize = 5;

export default function hash (s) {
    // const versionMark = "T1";
    const u8array = (typeof(s) == 'string') ? new TextEncoder().encode(s) : new Uint8Array(s);
    const inputLength = u8array.length;
    if (inputLength < minSize) throw new LengthError(
        `Input byte length too small: ${inputLength} < ${minSize}`
    );

    // 1. Process the byte string `u8array` with sliding window 5-wide into 32-bit Pearson buckets
    // 1a. Collect the self-permuting checksum along the way
    let checksum = 0;
    const salts = [2,3,5,7,11,13]
    const buckets = new Uint32Array(bucketArraySize);

    for (let windowEnd = windowSize; windowEnd <= inputLength; windowEnd++) {
        const windowStart = windowEnd - windowSize;

        const checkTri = [u8array[windowEnd-1],u8array[windowEnd-2],checksum];
        checksum = pearson(0,checkTri);

        for (const i of [0,1,2,3,4,5]) {
            const triplet = selectTriplet(i,u8array.slice(windowStart,windowEnd));
            buckets[pearson(salts[i],triplet)]++;
        }
    }

    // 2. calculate the quartiles
    let q1, q2, q3;
    [q1,q2,q3] = quartiles(buckets);

    // 3. construct the digest header
    const header = [
        headerVersion(TLSHVersion),
        ChecksumHex(checksum),
        LengthLog(inputLength),
        QRatios(q1,q2,q3)
    ].join('');

    // 4. construct the digest body
    const body = digestBody(buckets,q1,q2,q3);

    return `${header}${body}`;
}

function ByteToHex (i, reverse = false) {
    if (reverse) i = ((i & 0xF) << 4) | (i >> 4);
    return i.toString(16).padStart(2,'0');
}

function ChecksumHex(c) {
    return ByteToHex(c,true);   // needs 4-bit reversing
}

const LengthLog = LengthLogT1;
function LengthLogT1 (len) {
    const LOG_1_5 = 0.4054651;
    const LOG_1_3 = 0.26236426;
    const LOG_1_1 = 0.095310180;
    // const LOG_1_5 = Math.log(1.5);
    // const LOG_1_3 = Math.log(1.3);
    // const LOG_1_1 = Math.log(1.1);

    let result;
    if( len <= 656 ) {
        result = Math.floor( Math.log(len) / LOG_1_5 );
    } else if( len <= 3199 ) {
        result = Math.floor( Math.log(len) / LOG_1_3 - 8.72777 );
    } else {
        result = Math.floor( Math.log(len) / LOG_1_1 - 62.5472 );
    }

    // the high and low byte halves need to be swapped
    result = ((result & 0xF) << 4) | (result >> 4);

    return ByteToHex(result);
}

function headerVersion (version) {
    return 'T' + version.toString();
}

function QRatios (q1,q2,q3) {
    if (q3 == 0) throw new ComplexityError(); // ("Insufficient complexity");

    const q1_ratio = Math.floor(q1*100/q3) % 16;
    const q2_ratio = Math.floor(q2*100/q3) % 16;

    const quartileByte = (q1_ratio << 4) + q2_ratio;
    return ByteToHex(quartileByte);
}

function digestBody (buckets,q1,q2,q3) {
    const len = buckets.length;
    const accumulator = new Uint8ClampedArray(digestByteLength);

    for (let bi = 0; bi < len; bi+=4) {
        let byte = 0;
        for (let j = 0; j < 4; j++) {
            let emit = null;
            if      ( buckets[bi+j] <= q1 ) emit = 0;
            else if ( buckets[bi+j] <= q2 ) emit = 1;
            else if ( buckets[bi+j] <= q3 ) emit = 2;
            else                            emit = 3;
    
            if ( emit === null ) throw new Error("digest body construction failed to generate bits");
            byte += emit << (j*2);  // the byte is constructed little-endian, right-to-left...
        }
        const byteIndex = Math.floor(bi/4);
        accumulator[byteIndex] = (byte);
    }

    const hexString = accumulator.reduce((a,v) => { return ByteToHex(v) + a },'')    // uint8 to hexString, accumulated in reverse
    return hexString;
}

function selectTriplet(i,arr){
    // patterning of triplet selection (from inspecting cpp reference code)
    const patterns = [
        [4,3,2],    // j j-1 j-2    E D C
        [4,3,1],    // j j-1 j-3    E D B
        [4,2,1],    // j j-2 j-3    E C B
        [4,2,0],    // j j-2 j-4    E C A
        [4,3,0],    // j j-1 j-4    E D A
        [4,1,0],    // j j-3 j-4    E B A
    ]    
    function select(pattern,pos) {
        return patterns[pattern][pos];
    }

    const triplet = new Uint8Array(3);
    triplet[0] = arr[4];    // optimisation, since select(i,0) == 4 always
    triplet[1] = arr[select(i,1)];
    triplet[2] = arr[select(i,2)];

    return triplet;
}

function quartiles (bi) {
    const len = bi.length;
    if (len % 2 == 1) throw new Error('buckets array is not divisible by 2');

    const b = bi.toSorted();

    const centre = Math.floor(len / 2);
    const centreL = Math.floor(centre / 2);
    const centreR = centre + centreL;
    
    // A note about the algorithm's implementation.
    //
    // The paper defines q-values such that they're each < percentage of buckets.
    // This isn't derived by mathematical average of buckets either side of the position. Instead,
    // the algo uses the value of the bucket to the lower side as the q-value.
    // Though the mathematical average satisfies the paper's definition, it results in wrong q-ratios.

    const q1 = b[centreL-1];
    const q2 = b[centre -1];
    const q3 = b[centreR-1];
    return [q1, q2, q3];
}

class ComplexityError extends Error {
    constructor (message, options) {
        if (! message) message = "Insufficient complexity";
        super(message,options);
    }
}
class LengthError extends Error {
    constructor (message, options) {
        if (! message) message = "Insufficient complexity";
        super(message,options);
    }
}

export { hash, minSize, ComplexityError, LengthError };
