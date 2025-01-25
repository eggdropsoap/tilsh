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
        tlsh: "09F05A198CC69A5A4F0F9380A9EE93F2B927CF42089EA74276DC5F0BB2D34E68114448"
    }
]

export default testData;