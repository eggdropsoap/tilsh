const testData = [
    {
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
        text: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" style="height: 512px; width: 512px;">
<g transform="rotate(15,10,10)">
<path d="M10,0 a 10,10 0 0 1 0,20 a 10,10 0 0 1 0,-20
M10,2 a 8,8 0 0 0 0,16 a 8,8 0 0 0 0,-16
M5,5 v10 h10 v-10 h-2 v8 h-2 v-6 h-2 v6 h-2 v-8 z" fill="white" fill-opacity="1" stroke="black" stroke-width="0"></path>
</g></svg>
`.trim(),
        tlsh: `T147e0683d1308991c656a42c5dfbee205431c41f032180860ef9e1ae3a51458eec2b0f9`
    }
]

export default testData;