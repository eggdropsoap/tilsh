**tilsh** is an implementation of the TLSH locality-sensitive hashing algorithm in modern JavaScript.

A locality-sensitive hash algorithm generates *similar* hashes for similar inputs, instead of vastly different hashes for inputs with minor differences. This makes LSH algorithms useful for 'fingerprinting' documents. Hashes can be compared to generate a distance metric for identifying similar documents, or copies of the same document despite alterations.

The TLSH algorithm in particular was originally designed for spam and malware detection, with resistance to input changes from templating, programmatic changes, and changes introduced from passing through different systems and reformatting. It generates hashes with only minor variations when the input is substantially the same, even when parts are reordered or mangled.

This repo is not affiliated with the designers of the TLSH algorithm. For more about TLSH, see [The TLSH locality-sensitive hashing algorithm](#the-tlsh-locality-sensitive-hashing-algorithm) below.

# Usage

Install with your favourite package manager:

```sh
pnpm install git+https://github.com/eggdropsoap/tilsh.git
```

NPM packages are coming.

## Hashing text

tilsh exports a TLSH class constructor, and a suite of error types.

The `hash()` class method accepts a string or an octet array as its first argument, and outputs the T1-formatted hash string for that input. 

An constructor without an options argument will give and instance with standard T1 hash format and behaviour, with input requirements of at least 50 octets with a "sufficient" amount of complexity.

### Hashing 256 characters of UTF-8 Lorem ipsum text
```js
import { TLSH } from 'tilsh';

const t = new TLSH();
const lipsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed" + 
    " do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut" +
    " enim ad minim veniam, quis nostrud exercitation ullamco laboris" +
    " nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in"

t.hash(lipsum);
// 'T198d02b2d424c1b407f8361fbb36a555bd06835204722c749f9a5c12fcc01144c172262'

const lipsumArr = new TextEncoder().encode(lipsum);
t.hash(lipsumArr);
// 'T198d02b2d424c1b407f8361fbb36a555bd06835204722c749f9a5c12fcc01144c172262'
```

### Generating the hash of a file from disk in Node

Import TLSH and node's `fs`:

```js
import { TLSH } from 'tilsh';
import * as fs from 'fs';
```

Or if running in node REPL:

```js
const { TLSH } = await import("tilsh");
const fs = await import("fs");
```
Hash a well-known, stable file. Node's own distribution contains `node_object_wrap.h` which was [last updated December 24, 2019](https://github.com/nodejs/node/blob/main/src/node_object_wrap.h):
```js
let filepath = '/usr/local/include/node/';  // adjust for your OS and install of node
filepath += 'node_object_wrap.h';

const buffer = fs.readFileSync(filepath);    // notice this is *not* fs.readFileSync(filepath,'binary') !
const lsh = new TLSH().hash(buffer);
lsh;  // 'T1a9817508bbca8aa914b6e3ac625f4054d341a16b2626dfcc78dec2802f5513c85736f2'
```

*Notes*:

- Minor differences in the hash is expected (it's a feature!) if your installed `node_object_wrap.h` has different line endings than mine.
- tislh does not (yet) implement a guarantee of identical hashes on host systems with different endian-ness.

## Error handling

hash() throws `LengthError` when the input is too short, and `ComplexityError` when the input has insufficient variation (such as `'a'.repeat(256)`).

## Options

Pass a key-value object to the TLSH() constructor to alter the base hashing behaviour:

```js
const t1 = new TLSH({
  versionmark: false,  // include/omit the 'T1' format mark from output hashes [default true]
                       // NOTE omitting the mark is strongly discouraged by the spec!
                       // Compliant consumers must parse hashes with and without the mark the same.
  hashbytes: 64,       // output longer hashes for higher precision [default 32]
  conservative: true,  // raise input length minimum from 50 to 256 octets [default false]
})

const t0 = new TLSH({
  oldstyle: true  // preset: version mark, hash bytes 32 + header, 1-byte checksum, 256 input minimum
                  // Intended to match C++ reference release v3.17.0 default behaviour
});                                   
```

Options for variable-length checksum (0, 1, or 3), variable-width sliding windows (above 5 octets), and for the C++ version's old 48-bucket compilation option are not yet supported.

Invalid option values will throw `InvalidOptionsError`. Planned but unimplemented options will throw `NotImplementedError`. Unknown option keys will be ignored.

# The TLSH locality-sensitive hashing algorithm

This repo and author are not associated with the official TLSH site or authors.

For more information on the TLSH hashing algorithm, see:

- [tlsh.org](https://tlsh.org/) for whitepapers, documentation, discussion of the algorithm's strengths.
- [trendmicro/tlsh/](https://github.com/trendmicro/tlsh/) github repo for the C++ reference implementation and its bundled Python, Java, and JavaScript ports.

# Why tilsh? Why a new JavaScript implementation?

The official TLSH repo does have a JavaScript implementation. It's written in pre-ES6 syntax, and it's an almost straight transcription of the C++ code into JS. It's functional but hard to read and extend, and would need rewrites to be useful in modern JS projects anyway.

**tilsh** is written in JS-isms that are (more or less) natural to read and extend. Most importantly, it's an ES6 module with the goal of being usable across modern JS environments. It's also been a great way to study the algorithm and understand its behaviour from the inside.

"tilsh" was chosen because that's how I ended up pronouncing "TLSH", and the package name wasn't taken yet. Distinctness is good.

# Roadmap

- 0.3.0: diffing function to generate the similarity score between two hashes
- 0.4.0: [HAC-T](https://tlsh.org/papersDir/COINS_2020_camera_ready.pdf) implementation or equivalent fast-search clustering tree
- …
- 0.9.0: parity with C++ reference implementation's compilation and command line options
- 0.9+: guarantee identical hashes regardless of host system endian-ness
- 1.0.0: stable interface
- 1.0+: performance optimizations, service workers support, WASM compilation, etc.
