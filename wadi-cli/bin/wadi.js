#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function run(script) {
  const scriptPath = path.join(PROJECT_ROOT, script);

  spawnSync('powershell', [
    '-ExecutionPolicy','Bypass',
    '-File', scriptPath
  ], {
    stdio: 'inherit',
    cwd: PROJECT_ROOT,
    env: process.env
  });
}

const cmd = process.argv[2];

if (cmd === 'doctor') {
  run('wadi-doctor.ps1');
} else {
  console.log('Uso: wadi doctor');
}
