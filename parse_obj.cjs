const fs = require('fs');
const content = fs.readFileSync('public/Knuth v28.obj', 'utf-8');
const lines = content.split('\n');
let min = {x: Infinity, y: Infinity, z: Infinity};
let max = {x: -Infinity, y: -Infinity, z: -Infinity};

lines.forEach(line => {
    if (line.startsWith('v ')) {
        const parts = line.trim().split(/\s+/);
        const x = parseFloat(parts[1]);
        const y = parseFloat(parts[2]);
        const z = parseFloat(parts[3]);
        
        if (x < min.x) min.x = x;
        if (y < min.y) min.y = y;
        if (z < min.z) min.z = z;
        
        if (x > max.x) max.x = x;
        if (y > max.y) max.y = y;
        if (z > max.z) max.z = z;
    }
});

console.log('Min:', min);
console.log('Max:', max);
console.log('Center:', { x: (min.x+max.x)/2, y: (min.y+max.y)/2, z: (min.z+max.z)/2 });
console.log('Size:', { x: max.x-min.x, y: max.y-min.y, z: max.z-min.z });
