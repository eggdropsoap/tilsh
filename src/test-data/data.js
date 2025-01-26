import * as fs from 'fs';
import chardet from 'chardet';

const testData = [
    {
        name: "SVG 1",
        text: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" style="height: 512px; width: 512px;">
<g transform="rotate(15,10,10)">
<path d="M10,0 a 10,10 0 0 1 0,20 a 10,10 0 0 1 0,-20
M10,2 a 8,8 0 0 0 0,16 a 8,8 0 0 0 0,-16
M5,5 v10 h10 v-10 h-2 v8 h-2 v-6 h-2 v6 h-2 v-8 z" fill="black" fill-opacity="1" stroke="black" stroke-width="0"></path>
</g></svg>
`.trim(),
        tlsh: `T15be0683d1308991c65aa42c1dfbee245431c01f032140860ef9a16e3e51858eec2b0fe`
    },
    {
        name: "SVG 2",
        text: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" style="height: 512px; width: 512px;">
<g transform="rotate(15,10,10)">
<path d="M10,0 a 10,10 0 0 1 0,20 a 10,10 0 0 1 0,-20
M10,2 a 8,8 0 0 0 0,16 a 8,8 0 0 0 0,-16
M5,5 v10 h10 v-10 h-2 v8 h-2 v-6 h-2 v6 h-2 v-8 z" fill="white" fill-opacity="1" stroke="black" stroke-width="0"></path>
</g></svg>
`.trim(),
        tlsh: `T147e0683d1308991c656a42c5dfbee205431c41f032180860ef9e1ae3a51458eec2b0f9`
    },
    {
        name: "String 1",
        text: "This is a test for Lili Diao. This is a string. Hello Hello Hello " + 
            "OPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQ" +
            "\0",
        tlsh: "T109F05A198CC69A5A4F0F9380A9EE93F2B927CF42089EA74276DC5F0BB2D34E68114448"
    },
    {
        name: "String 2",
        text: "This is a test for Jon Oliver. This is a string. Hello Hello Hello "+
            "PQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHI"+
            "\0",
        tlsh: "T1301124198C869A5A4F0F9380A9AE92F2B9278F42089EA34272885F0FB2D34E6911444C"
    }
]

const cppReferenceTestData = [];

const testdir = "./c-ref/tlsh/Testing/example_data/";
const hashpath = `./c-ref/tlsh/Testing/tmp/out.parts.`;

const fullFileList = fs.readdirSync(testdir);

const nonAsciiList = [
    'MEDT6491.txt', // MED_Song
    'Week3.txt', // data
    'small2.txt', // Unicode text, UTF-8 text
    'spanish_place_namesA.txt', // ISO-8859 text, with very long lines (326)
    'spanish_place_namesB.txt', // ISO-8859 text, with very long lines (517)
    'survey_mathtch.txt', // ISO-8859 text, with CRLF, CR, LF line terminators
]

const cleanAsciiList = [
    '2006-07_Resource_Brochure.txt', // ASCII text
    '2006_2007PhysicalEducationConceptMap.txt', // ASCII text, with CR, LF line terminators
    'AccessToNationalSportsCentresPassportScheme.txt', // ASCII text, with very long lines (550), with CRLF, CR, LF line terminators
    'DanceFestOMAIPressReleaseFeb15_07.txt', // ASCII text, with very long lines (648)
    'Lotuspike-VBTD-Jenkins.txt', // ASCII text, with very long lines (428)
    'Meeting_the_Challenges.txt', // ASCII text, with very long lines (1545)
    'Memo_Ehrlich_1103.txt', // ASCII text, with very long lines (875)
    'ashaam2.txt', // ASCII text, with very long lines (846), with CRLF, CR, LF line terminators
    'exxonmobil_climate_change_backgrounder.txt', // ASCII text, with very long lines (939)
    'ledger091505.txt', // ASCII text, with very long lines (2523)
    'small.txt', // ASCII text
]

const passingAsciiList = [
    '2006-07_Resource_Brochure.txt', // ASCII text
    '2006_2007PhysicalEducationConceptMap.txt', // ASCII text, with CR, LF line terminators
    'DanceFestOMAIPressReleaseFeb15_07.txt', // ASCII text, with very long lines (648)
    'Lotuspike-VBTD-Jenkins.txt', // ASCII text, with very long lines (428)
    'ledger091505.txt', // ASCII text, with very long lines (2523)
]

const smallMixedList = [
    'small.txt', // ASCII text
    'small2.txt', // Unicode text, UTF-8 text
]

// const fileList = passingAsciiList;
// const fileList = cleanAsciiList;
// const fileList = nonAsciiList;
// const fileList = smallMixedList;
const fileList = fullFileList;


function readTestText(filename,detect=false,buffer=false) {
    const filepath = testdir + filename;

    if (detect) {
        // attempt to sniff the data encoding
        const encoding = chardet.detectFileSync(filepath);
        console.log(`${filename}: ${encoding}`);
        const dec = new TextDecoder(encoding)
        // note that reference test data encoding is windows-1252
        const buffer = fs.readFileSync(filepath);
        const content = dec.decode(buffer);
        console.warn("detect",buffer.length,content.length);
        // return dec.decode(content);
        return content;
    }
    else if (buffer) {
        const result = fs.readFileSync(filepath);
        console.warn("buffer",result.length);
        return result;
    }
    else {
        const content = fs.readFileSync(filepath,'binary');
        // console.warn(typeof(buffer));
        // const content = dec.decode(buffer);
        // return dec.decode(content);
        console.log("content",content.length)
        return content;
    }
}
function readTestHash(filename) {
    const filepath = hashpath + filename;
    const hash = fs.readFileSync(filepath,'ascii');
    return hash.split('\n')[0].trim();
}

fileList.forEach( (filename) => {
    const text = readTestText(filename,false,true);
    const hash = readTestHash(filename);
    // const decoder = new TextDecoder();

    cppReferenceTestData.push({
        name: filename,
        text: text,
        tlsh: hash
    })
});

const cppTestData = cppReferenceTestData;
console.log(cppTestData.slice(0,1));
// const cppTestData = cppReferenceTestData.slice(0,3);
// console.warn(cppReferenceTestData);

export default testData;
export { testData, cppTestData };