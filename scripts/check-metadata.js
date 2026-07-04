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
    'doctor:native',
    'patch:electron-builder-python'
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


const buildWorkflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'build-binaries.yaml'), 'utf8');
if (!buildWorkflow.includes('node-gyp@10.3.1')) {
    throw new Error('build workflow must pin node-gyp@10.3.1 instead of using node-gyp@latest');
}
if (buildWorkflow.includes('node-gyp@latest')) {
    throw new Error('build workflow must not install node-gyp@latest because Electron 12 native rebuilds are sensitive to node-gyp major changes');
}
if (!buildWorkflow.includes('GYP_DEFINES=openssl_fips=')) {
    throw new Error('build workflow must define GYP_DEFINES=openssl_fips= for Electron 12 header gyp conditions');
}

const appNpmrc = fs.readFileSync(path.join(root, 'src', '.npmrc'), 'utf8');
if (appNpmrc.includes('node_gyp=')) {
    throw new Error('src/.npmrc must not set node_gyp because the copied prebuild .npmrc breaks node-pty rebuilds on Windows');
}
if (!buildWorkflow.includes('node-gyp.cmd')) {
    throw new Error('Windows build workflow must point npm_config_node_gyp at node-gyp.cmd, not a JavaScript file');
}
if (!buildWorkflow.includes('--security-revert=CVE-2024-27980')) {
    throw new Error('Windows build workflow must scope NODE_OPTIONS=--security-revert=CVE-2024-27980 to the node-pty packaging rebuild');
}
if (!buildWorkflow.includes('npm run patch:electron-builder-python')) {
    throw new Error('macOS build workflow must patch electron-builder /usr/bin/python references before creating DMGs');
}
if (!fs.readFileSync(path.join(root, 'scripts', 'patch-electron-builder-python.js'), 'utf8').includes('sys.setdefaultencoding')) {
    throw new Error('macOS electron-builder patch must handle Python 2 sys.setdefaultencoding calls under Python 3');
}

console.log('package metadata ok');
