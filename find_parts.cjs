const fs = require('fs');
const content = fs.readFileSync('public/Knuth v28.obj', 'utf-8');
const lines = content.split('\n');

let currentGroup = '';
const groups = {};

lines.forEach(line => {
    if (line.startsWith('g ') || line.startsWith('o ')) {
        currentGroup = line.substring(2).trim();
        if (!groups[currentGroup]) {
            groups[currentGroup] = { min: {x: Infinity, y: Infinity, z: Infinity}, max: {x: -Infinity, y: -Infinity, z: -Infinity}, count: 0 };
        }
    } else if (line.startsWith('v ') && currentGroup) {
        const parts = line.trim().split(/\s+/);
        const x = parseFloat(parts[1]);
        const y = parseFloat(parts[2]);
        const z = parseFloat(parts[3]);
        
        const g = groups[currentGroup];
        if (x < g.min.x) g.min.x = x;
        if (y < g.min.y) g.min.y = y;
        if (z < g.min.z) g.min.z = z;
        if (x > g.max.x) g.max.x = x;
        if (y > g.max.y) g.max.y = y;
        if (z > g.max.z) g.max.z = z;
        g.count++;
    }
});

for (const [name, g] of Object.entries(groups)) {
    if (g.count > 0) {
        const cx = (g.min.x + g.max.x) / 2;
        const cy = (g.min.y + g.max.y) / 2;
        const cz = (g.min.z + g.max.z) / 2;
        
        if (name.toLowerCase().includes('chuck') || 
            name.toLowerCase().includes('tail') || 
            name.toLowerCase().includes('head') ||
            name.toLowerCase().includes('carriage') ||
            name.toLowerCase().includes('spindle') ||
            name.toLowerCase().includes('tool') ||
            name.toLowerCase().includes('cekam') ||
            name.toLowerCase().includes('eretan')) {
            console.log(`Part: ${name}`);
            console.log(`  Center: [${cx.toFixed(2)}, ${cy.toFixed(2)}, ${cz.toFixed(2)}]`);
        }
    }
}
// Just list all unique group names if no matches
const names = Object.keys(groups).filter(n => groups[n].count > 0);
console.log("Total groups:", names.length);
if(names.length < 50) console.log("Names:", names);
