import { cp, mkdir, readdir, rm } from 'node:fs/promises';

for (const [sourcePath, destinationPath] of [
  ['../contract/src/managed/auction/', '../public/contract/auction/'],
  ['../contract/src/managed/auction-v8/', '../public/contract/auction-v8/'],
]) {
  const source = new URL(sourcePath, import.meta.url);
  const destination = new URL(destinationPath, import.meta.url);
  await mkdir(destination, { recursive: true });
  await Promise.all(['compiler', 'zkir'].map((name) => cp(new URL(name, source), new URL(name, destination), { recursive: true })));
  const sourceKeys = new URL('keys/', source);
  const destinationKeys = new URL('keys/', destination);
  await mkdir(destinationKeys, { recursive: true });
  const verifierKeys = (await readdir(sourceKeys)).filter((name) => name.endsWith('.verifier'));
  const publicKeys = await readdir(destinationKeys);
  await Promise.all([
    ...verifierKeys.map((name) => cp(new URL(name, sourceKeys), new URL(name, destinationKeys))),
    ...publicKeys.filter((name) => !name.endsWith('.verifier')).map((name) => rm(new URL(name, destinationKeys))),
  ]);
}
console.log('Published the ledger-v9 and retained ledger-v8 verifier keys and ZKIR under public/contract.');
