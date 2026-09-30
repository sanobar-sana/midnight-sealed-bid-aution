import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const compiler = resolve(root, '.compact/bin/compactc');
const legacyCompiler = resolve(root, '.compact-v8/versions/0.31.1');
const infoPath = resolve(root, 'contract/src/managed/auction/compiler/contract-info.json');
const legacyInfoPath = resolve(root, 'contract/src/managed/auction-v8/compiler/contract-info.json');

if (existsSync(compiler)) {
  execFileSync('compact', ['compile', 'src/auction.compact', 'src/managed/auction'], {
    cwd: resolve(root, 'contract'),
    stdio: 'inherit',
    env: { ...process.env, COMPACT_DIRECTORY: resolve(root, '.compact') },
  });
} else {
  const info = JSON.parse(readFileSync(infoPath, 'utf8'));
  if (info['compiler-version'] !== '0.35.0' || info['runtime-version'] !== '0.20.0') {
    throw new Error('No pinned Compact 0.35.0 toolchain is installed and checked-in contract artifacts are incompatible.');
  }
  console.info('Compact toolchain unavailable; using checked-in Compact 0.35.0 contract artifacts.');
}

if (existsSync(legacyCompiler)) {
  execFileSync('compact', ['update', '0.31.1'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, COMPACT_DIRECTORY: resolve(root, '.compact-v8') },
  });
  execFileSync('compact', ['compile', 'src/auction.compact', 'src/managed/auction-v8'], {
    cwd: resolve(root, 'contract'),
    stdio: 'inherit',
    env: { ...process.env, COMPACT_DIRECTORY: resolve(root, '.compact-v8') },
  });
  const legacyModule = resolve(root, 'contract/src/managed/auction-v8/contract/index.js');
  writeFileSync(
    legacyModule,
    readFileSync(legacyModule, 'utf8').replaceAll("'@midnight-ntwrk/compact-runtime'", "'compact-runtime-ledger8'").replaceAll('"@midnight-ntwrk/compact-runtime"', '"compact-runtime-ledger8"'),
  );
} else {
  const legacyInfo = JSON.parse(readFileSync(legacyInfoPath, 'utf8'));
  if (legacyInfo['compiler-version'] !== '0.31.1' || legacyInfo['runtime-version'] !== '0.16.0') {
    throw new Error('No pinned Compact 0.31.1 toolchain is installed and checked-in ledger-v8 artifacts are incompatible.');
  }
  console.info('Compact 0.31.1 toolchain unavailable; using checked-in ledger-v8 contract artifacts.');
}

execFileSync(process.execPath, ['../scripts/copy-contract-assets.js'], { cwd: resolve(root, 'contract'), stdio: 'inherit' });
