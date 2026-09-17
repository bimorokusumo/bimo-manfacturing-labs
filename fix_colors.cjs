const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace text colors
    content = content.replace(/color:\s*['"]#fff['"]/gi, "color: 'var(--text-main)'");
    content = content.replace(/color:\s*['"]white['"]/gi, "color: 'var(--text-main)'");
    content = content.replace(/color:\s*['"]#ffffff['"]/gi, "color: 'var(--text-main)'");
    
    // Specifically fix dark backgrounds to use CSS vars
    content = content.replace(/backgroundColor:\s*['"]#0b1120['"]/gi, "backgroundColor: 'var(--bg-game)'");
    content = content.replace(/background:\s*['"]#0f172a['"]/gi, "background: 'var(--bg-card)'");

    fs.writeFileSync(file, content, 'utf8');
});
console.log('Fixed colors in ' + files.length + ' files.');
