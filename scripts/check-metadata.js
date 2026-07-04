#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function readJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const root = process.cwd();
const rootPackage = readJson(path.join(root, 'package.json'));
const appPackage = readJson(path.join(root, 'src', 'package.json'));

const requiredScripts = [
    'start',
    'install-linux',
    'install-darwin',
    'install-windows',
    'build-linux',
    'build-darwin',
    'build-darwin-x64',
    'build-darwin-arm64',
    'build-windows',
    'doctor:native'
];

const missingScripts = requiredScripts.filter(script => !rootPackage.scripts || !rootPackage.scripts[script]);
if (missingScripts.length > 0) {
    throw new Error(`Missing package scripts: ${missingScripts.join(', ')}`);
}

const macTargets = rootPackage.build && rootPackage.build.mac && rootPackage.build.mac.target;
const dmgTarget = Array.isArray(macTargets) && macTargets.find(target => target.target === 'dmg');
const macArches = dmgTarget && Array.isArray(dmgTarget.arch) ? dmgTarget.arch : [];
for (const arch of ['x64', 'arm64']) {
    if (!macArches.includes(arch)) {
        throw new Error(`macOS DMG target is missing ${arch}`);
    }
}

if (rootPackage.version !== appPackage.version) {
    throw new Error(`Version mismatch: root=${rootPackage.version}, src=${appPackage.version}`);
}



for (const scriptName of ['prebuild-linux', 'prebuild-darwin', 'prebuild-windows']) {
    if (!rootPackage.scripts[scriptName].includes('npm install --ignore-scripts')) {
        throw new Error(`${scriptName} must install with --ignore-scripts so native modules are rebuilt by electron-builder for Electron`);
    }
}

const appNpmrc = fs.readFileSync(path.join(root, 'src', '.npmrc'), 'utf8');
if (!appNpmrc.includes('node_gyp=../node_modules/node-gyp/bin/node-gyp.js')) {
    throw new Error('src/.npmrc must point nested installs at the root workspace node-gyp');
}

console.log('package metadata ok');
