#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const childProcess = require('child_process');

const root = path.resolve(__dirname, '..');
const rootPackage = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const appPackage = JSON.parse(fs.readFileSync(path.join(root, 'src', 'package.json'), 'utf8'));

function run(command, args) {
    try {
        const result = childProcess.spawnSync(command, args, {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe']
        });
        if (result.error || result.status !== 0) return null;
        return result.stdout.trim() || result.stderr.trim();
    } catch (error) {
        return null;
    }
}

function hasCommand(command) {
    if (process.platform === 'win32') {
        return run('where', [command]) !== null;
    }
    return run('sh', ['-c', `command -v ${command}`]) !== null;
}

const report = {
    platform: process.platform,
    arch: process.arch,
    cpu: os.cpus()[0] && os.cpus()[0].model,
    node: process.versions.node,
    nodeModulesAbi: process.versions.modules,
    npm: run('npm', ['--version']),
    electron: rootPackage.dependencies.electron,
    electronBuilder: rootPackage.dependencies['electron-builder'],
    nativeDependencies: {
        'node-pty': appPackage.dependencies['node-pty'],
        'osx-temperature-sensor': appPackage.optionalDependencies && appPackage.optionalDependencies['osx-temperature-sensor']
    },
    toolchain: {
        python3: hasCommand('python3'),
        python: hasCommand('python'),
        make: hasCommand('make'),
        gcc: hasCommand('gcc'),
        xcodebuild: process.platform === 'darwin' ? hasCommand('xcodebuild') : undefined,
        msbuild: process.platform === 'win32' ? hasCommand('msbuild') : undefined
    },
    appleSiliconReady: rootPackage.build.mac.target.some(target => {
        return target.target === 'dmg' && target.arch.includes('arm64');
    })
};

console.log(JSON.stringify(report, null, 2));

if (process.platform === 'darwin' && process.arch === 'arm64' && !report.appleSiliconReady) {
    process.exitCode = 1;
}
