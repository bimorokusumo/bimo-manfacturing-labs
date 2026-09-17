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
    content = content.replace(/color:\s*['"]#fff['"]/g, "color: 'var(--text-main)'");
    content = content.replace(/color:\s*['"]white['"]/g, "color: 'var(--text-main)'");
    
    // Specifically fix LandingPage dark backgrounds
    content = content.replace(/backgroundColor:\s*['"]#0b1120['"]/g, "backgroundColor: 'var(--bg-game)'");
    
    // In LearningLabView, there is background: '#0f172a'
    content = content.replace(/background:\s*['"]#0f172a['"]/g, "background: 'var(--bg-card)'");

    fs.writeFileSync(file, content, 'utf8');
});
console.log('Fixed colors in ' + files.length + ' files.');
