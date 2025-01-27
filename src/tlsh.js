import pearson from './pearson.js';

const TLSHVersion = 1;

const defaultMinInputSize = 50;         // new style, but requires a minimum amount of randomness
const conservativeMinInputSize = 256;   // old style, for compatibility
const digestBodyLength = {  // in bytes, not hex
    standard: 32,   // standard
    expanded: 64,   // now possible with 256 buckets, but not yet implemented in reference spec and fails tests
}

class TLSH {
    static HashVersion = 1;
    static options = {
        supported: [
            'versionmark',
            'hashbytes',
            // 'checksum',
            // 'windowsize',
            'conservative',
            // 'buckets48', // for feature parity with c++ compile option
            // 'oldstyle',  // a preset
            // 'version',   // for future hash versions T2+ and implementing version selection
        ],
        validation: {
            versionmark: [true,false],
            hashbytes: [32,64],
            checksum: [1],
            windowsize: [5],
            conservative: [true,false],
            // buckets48: [true,false],
            oldstyle: [true,false],
            // version: [1]
        }
    }
    constructor(
        {
            versionmark = true,     // default: include 'T1' version tag on hash outputs
            hashbytes = 32,         // 32 [default] or 64 bytes
            checksum = 1,           // 1 [default], 0, or 3 bytes   // option not implemented
            windowsize = 5,         // 5 [default]                  // option not implemented
            conservative = false,   // default: min input length 50, true: min input length 256
            oldstyle = false,       // true activates preset: {hashbytes: 32, checksum: 1, conservative: true, versionmark: false}
        } = {}
    ) {
        const errorContext = 'TLSH constructor';
        const errorList = []
        // check for unimplemented options being used
        Object.keys(arguments[0] || {}).forEach( k => {
            if (! TLSH.options.supported.includes(k) ) errorList.push(k);
        });
        if (errorList.length > 0) throw new NotImplementedError(`${errorContext} options: ${errorList.join(', ')}`);
        // check for illegal option values
        Object.entries(TLSH.options.validation).forEach( ([opt, vals]) => {
            if (! vals.includes(eval(opt))) errorList.push(`${opt}: ${eval(opt)}`);
        })
        if ( errorList.length > 0 ) throw new InvalidOptionsError(`${errorContext}: ${errorList.join(', ')}`);
        
        // set up class properties
        if (oldstyle) {
            // preset to options equivalent to c++ reference's version 3.17.0
            hashbytes = 32,
            checksum = 1,
            conservative = true,
            versionmark = false
        }
        this.useVersionMark = versionmark;
        this.minSize = conservative ? conservativeMinInputSize : defaultMinInputSize;
        this.digestByteLength = hashbytes == 32 ? digestBodyLength.standard : digestBodyLength.expanded;
        this.bucketArraySize = this.digestByteLength * 4;
        this.windowSize = 5;
    }

    hash (s) {
        const minSize = this.minSize;
        const u8array = (typeof(s) == 'string') ? new TextEncoder().encode(s) : new Uint8Array(s);
        const inputLength = u8array.length;
        if (inputLength < minSize) throw new LengthError(
            `Input byte length too small: ${inputLength} < ${minSize}`
        );
    
        // 1. Process the byte string `u8array` with 5-wide sliding window into 32-bit Pearson-indexed buckets
        // 1a. Collect the self-permuting checksum along the way
        let checksum = 0;
        const salts = [2,3,5,7,11,13]
        const buckets = new Uint32Array(this.bucketArraySize);
    
        for (let windowEnd = this.windowSize; windowEnd <= inputLength; windowEnd++) {
            const windowStart = windowEnd - this.windowSize;
    
            const checkTri = [u8array[windowEnd-1],u8array[windowEnd-2],checksum];
            checksum = pearson(0,checkTri);
    
            for (const i of [0,1,2,3,4,5]) {
                const triplet = this.#selectTriplet(i,u8array.slice(windowStart,windowEnd));
                const p = pearson(salts[i],triplet); 
                buckets[p]++;
            }
        }
    
        // 2. calculate the quartiles
        let q1, q2, q3;
        [q1,q2,q3] = this.#bucketQuartiles(buckets);
    
        // 3. construct the digest header
        const header = [
            this.#versionMark(TLSH.HashVersion),
            this.#checksumHex(checksum),
            this.#lengthLog(inputLength),
            this.#qRatios(q1,q2,q3)
        ].join('');
    
        // 4. construct the digest body
        const body = this.#digestBody(buckets,q1,q2,q3);
    
        return `${header}${body}`;
    }

    #digestBody (buckets,q1,q2,q3) {
        const len = buckets.length;
        const accumulator = new Uint8ClampedArray(this.digestByteLength);
    
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
    
        const hexString = accumulator.reduce((a,v) => { return this.#byteToHex(v) + a },'')    // uint8 to hexString, accumulated in reverse
        return hexString;
    }

    #byteToHex (i, reverse = false) {
        if (reverse) i = ((i & 0xF) << 4) | (i >> 4);
        return i.toString(16).padStart(2,'0');
    }

    #checksumHex(c) {
        return this.#byteToHex(c,true);   // needs 4-bit reversing
    }

    #lengthLog = this.#lengthLogT1;
    #lengthLogT1 (len) {
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
    
        return this.#byteToHex(result);
    }
    
    #versionMark (version) {

        return (this.useVersionMark & version != 0) ? `T${version}` : '';
    }
    
    #qRatios (q1,q2,q3) {
        if (q3 == 0) throw new ComplexityError(); // ("Insufficient complexity");
    
        const q1_ratio = Math.floor(q1*100/q3) % 16;
        const q2_ratio = Math.floor(q2*100/q3) % 16;
    
        const quartileByte = (q1_ratio << 4) + q2_ratio;
        return this.#byteToHex(quartileByte);
    }

    #selectTriplet(i,arr){
        // Patterning of triplet selection (from inspecting cpp reference code).
        // This processes the sliding window back-to-front.
        // Order doensn't matter to final output, but the pattern paired with the right salt does.
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
    
    #bucketQuartiles (bi) {
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
class InvalidOptionsError extends Error {
    constructor (message, options) {
        const defaultMessage = "Invalid option"
        message = message ? defaultMessage + `: ${message}` : defaultMessage;
        super(message,options);
    }
}
class NotImplementedError extends Error {
    constructor (message, options) {
        const defaultMessage = "Not implemented"
        message = message ? defaultMessage + `: ${message}` : defaultMessage;
        super(message,options);
    }
}

export default TLSH;
export { TLSH, ComplexityError, LengthError, NotImplementedError, InvalidOptionsError };
