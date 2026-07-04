#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const targets = [
    path.join(root, 'node_modules', 'app-builder-lib'),
    path.join(root, 'node_modules', 'builder-util'),
    path.join(root, 'node_modules', 'dmg-builder')
];

let patchedFiles = 0;

function patchFile(file) {
    const before = fs.readFileSync(file, 'utf8');
    if (!before.includes('/usr/bin/python')) {
        return;
    }

    const after = before.replace(/\/usr\/bin\/python(?!3)/g, '/usr/bin/python3');
    if (after !== before) {
        fs.writeFileSync(file, after);
        patchedFiles += 1;
        console.log(`patched ${path.relative(root, file)}`);
    }
}

function walk(dir) {
    if (!fs.existsSync(dir)) {
        return;
    }

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(fullPath);
        } else if (/\.(js|json)$/.test(entry.name)) {
            patchFile(fullPath);
        }
    }
}

if (process.platform !== 'darwin') {
    console.log('electron-builder python patch skipped: not darwin');
    process.exit(0);
}

for (const target of targets) {
    walk(target);
}

console.log(`electron-builder python patch complete: ${patchedFiles} file(s) patched`);
