import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../src/', import.meta.url));
const files = fs.readdirSync(root, { recursive: true }).filter((name) => /\.(ts|tsx)$/.test(name));
const graph = new Map();
const allowed = {
  models: new Set(['models']),
  adapter: new Set(['adapter', 'models']),
  components: new Set(['components', 'models', 'adapter', 'assets', 'styles']),
  pages: new Set(['pages', 'components', 'models', 'adapter', 'assets', 'styles']),
  content: new Set(['content', 'pages', 'components', 'models', 'adapter', 'assets', 'styles']),
};
for (const name of files) {
  const file = path.resolve(root, name);
  const relative = name.replaceAll('\\', '/');
  const layer = relative.split('/')[0];
  const source = fs.readFileSync(file, 'utf8');
  const dependencies = [];
  for (const match of source.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)['"]([^'"]+)['"]/g)) {
    const specifier = match[1].split('?')[0];
    if (!specifier.startsWith('.')) continue;
    const target = path.resolve(path.dirname(file), specifier);
    const destination = path.relative(root, target).replaceAll('\\', '/');
    assert.ok(!destination.startsWith('../'), `${relative}: import escapes src`);
    const targetLayer = destination.split('/')[0].replace(/\.[^.]+$/, '');
    if (allowed[layer])
      assert.ok(allowed[layer].has(targetLayer), `${relative} must not depend on ${destination}`);
    if (layer === 'pages' && targetLayer === 'pages') {
      assert.equal(
        destination.split('/')[1],
        relative.split('/')[1],
        'Pages must share components/models rather than importing another page',
      );
    }
    const resolved = [target, target + '.ts', target + '.tsx'].find(
      (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
    );
    assert.ok(resolved, `${relative}: missing import ${specifier}`);
    if (/\.(ts|tsx)$/.test(resolved)) dependencies.push(resolved);
  }
  graph.set(file, dependencies);
  if (layer === 'adapter')
    assert.doesNotMatch(
      source,
      /lms-plus-root|lms-plus:restore|lms-plus-home-page/,
      'Adapters must not manage extension mounting',
    );
}
const visiting = new Set();
const visited = new Set();
function visit(file) {
  assert.ok(!visiting.has(file), `Dependency cycle at ${path.relative(root, file)}`);
  if (visited.has(file)) return;
  visiting.add(file);
  for (const target of graph.get(file) ?? []) visit(target);
  visiting.delete(file);
  visited.add(file);
}
for (const file of graph.keys()) visit(file);
console.log('PASS: module boundaries, resolved local imports and acyclic dependencies.');
