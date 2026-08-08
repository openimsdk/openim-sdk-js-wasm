import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const projectDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const coreDir = path.resolve(
  process.env.OPENIM_SDK_CORE_DIR ||
    path.join(projectDir, '..', 'openim-sdk-core')
);
const failures = [];
const knownCoreDatabaseNoOps = new Set([
  'deleteExpireUpload',
  'updateOrCreateConversations',
]);
const knownCoreDatabaseBridgeIssues = new Set([
  'close',
  'updateAllConversation',
]);

function fail(message) {
  failures.push(message);
}

function walk(directory, extension) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return walk(target, extension);
    }
    return entry.isFile() && target.endsWith(extension) ? [target] : [];
  });
}

function stripComments(source) {
  let output = '';
  let state = 'code';
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (state === 'lineComment') {
      if (char === '\n') {
        state = 'code';
        output += char;
      } else {
        output += ' ';
      }
      continue;
    }
    if (state === 'blockComment') {
      if (char === '*' && next === '/') {
        output += '  ';
        index += 1;
        state = 'code';
      } else {
        output += char === '\n' ? '\n' : ' ';
      }
      continue;
    }
    if (state === 'string') {
      output += char;
      if (char === '\\') {
        output += next || '';
        index += 1;
      } else if (char === '"') {
        state = 'code';
      }
      continue;
    }
    if (state === 'rawString') {
      output += char;
      if (char === '`') {
        state = 'code';
      }
      continue;
    }
    if (char === '/' && next === '/') {
      output += '  ';
      index += 1;
      state = 'lineComment';
    } else if (char === '/' && next === '*') {
      output += '  ';
      index += 1;
      state = 'blockComment';
    } else {
      output += char;
      if (char === '"') {
        state = 'string';
      } else if (char === '`') {
        state = 'rawString';
      }
    }
  }
  return output;
}

function findClosing(source, openingIndex, opening, closing) {
  let depth = 0;
  let quote = '';
  for (let index = openingIndex; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (quote !== '`' && char === '\\') {
        index += 1;
      } else if (char === quote) {
        quote = '';
      }
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
    } else if (char === opening) {
      depth += 1;
    } else if (char === closing) {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }
  throw new Error(`Unclosed ${opening} at offset ${openingIndex}`);
}

function countArguments(argumentsSource) {
  if (!argumentsSource.trim()) {
    return 0;
  }
  let count = 1;
  let depth = 0;
  let quote = '';
  for (let index = 0; index < argumentsSource.length; index += 1) {
    const char = argumentsSource[index];
    if (quote) {
      if (quote !== '`' && char === '\\') {
        index += 1;
      } else if (char === quote) {
        quote = '';
      }
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
    } else if (char === '(' || char === '[' || char === '{') {
      depth += 1;
    } else if (char === ')' || char === ']' || char === '}') {
      depth -= 1;
    } else if (char === ',' && depth === 0) {
      count += 1;
    }
  }
  return count;
}

function collectCoreDatabaseCalls() {
  const calls = new Map();
  const implementations = new Set();
  const delegations = new Set();
  const filenames = [
    ...walk(path.join(coreDir, 'wasm', 'indexdb'), '.go'),
    path.join(coreDir, 'pkg', 'db', 'db_js.go'),
  ];
  for (const filename of filenames) {
    const source = stripComments(fs.readFileSync(filename, 'utf8'));
    const functionPattern =
      /func\s+\(\s*(\w+)[^)]*\)\s+([A-Z]\w*)\s*\([^)]*\)[^{]*\{/g;
    for (const match of source.matchAll(functionPattern)) {
      const receiverName = match[1];
      const methodName = match[2];
      const jsMethodName = methodName[0].toLowerCase() + methodName.slice(1);
      implementations.add(jsMethodName);
      const openingBrace = match.index + match[0].lastIndexOf('{');
      const closingBrace = findClosing(source, openingBrace, '{', '}');
      const body = source.slice(openingBrace + 1, closingBrace);
      if (new RegExp(`\\b${receiverName}\\.[A-Z]\\w*\\s*\\(`).test(body)) {
        delegations.add(jsMethodName);
      }
      const arities = new Set();
      const callPattern = /exec\.Exec\s*\(/g;
      for (const call of body.matchAll(callPattern)) {
        const openingParen = call.index + call[0].lastIndexOf('(');
        const closingParen = findClosing(body, openingParen, '(', ')');
        arities.add(countArguments(body.slice(openingParen + 1, closingParen)));
      }
      if (arities.size > 0) {
        calls.set(jsMethodName, {
          arities,
          filename,
        });
      }
    }
  }
  return { calls, implementations, delegations };
}

function collectDatabaseInterfaceMethods() {
  const source = fs.readFileSync(
    path.join(coreDir, 'pkg', 'db', 'db_interface', 'databse.go'),
    'utf8'
  );
  const methods = new Set();
  for (const match of source.matchAll(/^\s*([A-Z]\w*)\s*\(/gm)) {
    methods.add(match[1][0].toLowerCase() + match[1].slice(1));
  }
  return methods;
}

function parseTypeScript(filename) {
  return ts.createSourceFile(
    filename,
    fs.readFileSync(filename, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
}

function visit(node, callback) {
  callback(node);
  ts.forEachChild(node, child => visit(child, callback));
}

function collectWindowMappings() {
  const mappings = new Map();
  const source = parseTypeScript(
    path.join(projectDir, 'src', 'api', 'index.ts')
  );
  visit(source, node => {
    if (
      !ts.isBinaryExpression(node) ||
      node.operatorToken.kind !== ts.SyntaxKind.EqualsToken ||
      !ts.isPropertyAccessExpression(node.left) ||
      node.left.expression.getText(source) !== 'window' ||
      !ts.isCallExpression(node.right) ||
      node.right.expression.getText(source) !== 'registeMethodOnWindow' ||
      !node.right.arguments[0] ||
      !ts.isStringLiteral(node.right.arguments[0])
    ) {
      return;
    }
    mappings.set(node.left.name.text, node.right.arguments[0].text);
  });
  return mappings;
}

function collectWorkerMappings() {
  const mappings = new Map();
  const source = parseTypeScript(
    path.join(projectDir, 'src', 'api', 'worker.ts')
  );
  visit(source, node => {
    if (
      !ts.isCallExpression(node) ||
      node.expression.getText(source) !== 'rpc.registerMethod' ||
      node.arguments.length < 2 ||
      !ts.isStringLiteral(node.arguments[0]) ||
      !ts.isIdentifier(node.arguments[1])
    ) {
      return;
    }
    mappings.set(node.arguments[0].text, node.arguments[1].text);
  });
  return mappings;
}

function collectTypeScriptFunctions() {
  const functions = new Map();
  const apiDirectory = path.join(projectDir, 'src', 'api');
  for (const filename of walk(apiDirectory, '.ts')) {
    const source = parseTypeScript(filename);
    visit(source, node => {
      if (!ts.isFunctionDeclaration(node) || !node.name) {
        return;
      }
      const minimum = node.parameters.filter(
        parameter =>
          !parameter.questionToken &&
          !parameter.initializer &&
          !parameter.dotDotDotToken
      ).length;
      const hasRest = node.parameters.some(
        parameter => parameter.dotDotDotToken
      );
      functions.set(node.name.text, {
        minimum,
        maximum: hasRest ? Number.POSITIVE_INFINITY : node.parameters.length,
        filename,
      });
    });
  }
  return functions;
}

function collectSdkWindowReferences() {
  const references = new Set();
  const source = parseTypeScript(
    path.join(projectDir, 'src', 'sdk', 'index.ts')
  );
  visit(source, node => {
    if (
      ts.isPropertyAccessExpression(node) &&
      node.expression.getText(source) === 'window'
    ) {
      references.add(node.name.text);
    }
  });
  return references;
}

function collectCoreExports() {
  const source = fs.readFileSync(
    path.join(coreDir, 'wasm', 'cmd', 'main.go'),
    'utf8'
  );
  const exports = new Set(['commonEventFunc']);
  for (const match of source.matchAll(
    /js\.Global\(\)\.Set\("([A-Za-z0-9_]+)"/g
  )) {
    exports.add(match[1]);
  }
  return exports;
}

function collectGoFunctionArities(directory) {
  const functions = new Map();
  for (const filename of walk(directory, '.go')) {
    const source = stripComments(fs.readFileSync(filename, 'utf8'));
    for (const match of source.matchAll(/^func\s+([A-Za-z_]\w*)\s*\(/gm)) {
      const openingParen = match.index + match[0].lastIndexOf('(');
      const closingParen = findClosing(source, openingParen, '(', ')');
      functions.set(
        match[1],
        countArguments(source.slice(openingParen + 1, closingParen))
      );
    }
  }
  return functions;
}

function collectCoreExportArities() {
  const apiFunctions = collectGoFunctionArities(
    path.join(coreDir, 'open_im_sdk')
  );
  const wrapperDirectory = path.join(coreDir, 'wasm', 'wasm_wrapper');
  const wrapperFunctions = collectGoFunctionArities(wrapperDirectory);
  const wrapperMethods = new Map();

  for (const filename of walk(wrapperDirectory, '.go')) {
    const source = stripComments(fs.readFileSync(filename, 'utf8'));
    const methodPattern =
      /func\s+\([^)]*\)\s+([A-Z]\w*)\s*\([^)]*\)\s*(?:interface\{\}|[^{]*)\s*\{/g;
    for (const match of source.matchAll(methodPattern)) {
      const openingBrace = match.index + match[0].lastIndexOf('{');
      const closingBrace = findClosing(source, openingBrace, '{', '}');
      wrapperMethods.set(
        match[1],
        source.slice(openingBrace + 1, closingBrace)
      );
    }
  }

  const mainSource = fs.readFileSync(
    path.join(coreDir, 'wasm', 'cmd', 'main.go'),
    'utf8'
  );
  const arities = new Map();
  for (const registration of mainSource.matchAll(
    /js\.Global\(\)\.Set\("([A-Za-z0-9_]+)",\s*js\.FuncOf\(\w+\.(\w+)\)\)/g
  )) {
    const [exportName, methodName] = registration.slice(1);
    const body = wrapperMethods.get(methodName);
    if (!body) {
      continue;
    }
    const caller = body.match(
      /NewCaller\(\s*(?:(open_im_sdk)\.)?(\w+)\s*,\s*([^,]+),\s*&args\s*\)/
    );
    if (!caller) {
      continue;
    }
    const targetFunctions = caller[1] ? apiFunctions : wrapperFunctions;
    const functionArity = targetFunctions.get(caller[2]);
    if (functionArity === undefined) {
      fail(
        `Core export ${exportName} calls ${caller[2]}, but its signature was not found`
      );
      continue;
    }
    const hasCallback = caller[3].trim() !== 'nil';
    arities.set(exportName, functionArity - (hasCallback ? 1 : 0));
  }
  return arities;
}

function collectSdkInvocationArities() {
  const arities = new Map();
  const source = parseTypeScript(
    path.join(projectDir, 'src', 'sdk', 'index.ts')
  );
  const add = (name, arity) => {
    if (!arities.has(name)) {
      arities.set(name, new Set());
    }
    arities.get(name).add(arity);
  };

  visit(source, node => {
    if (!ts.isCallExpression(node)) {
      return;
    }

    if (
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.expression.getText(source) === 'window'
    ) {
      add(node.expression.name.text, node.arguments.length);
      return;
    }

    if (
      node.expression.getText(source) !== 'this._invoker' ||
      !node.arguments[1] ||
      !ts.isPropertyAccessExpression(node.arguments[1]) ||
      node.arguments[1].expression.getText(source) !== 'window'
    ) {
      return;
    }

    const exportName = node.arguments[1].name.text;
    const args = node.arguments[2];
    if (!args || !ts.isArrayLiteralExpression(args)) {
      fail(
        `SDK invocation of ${exportName} does not use a static argument list`
      );
      return;
    }
    if (args.elements.some(element => ts.isSpreadElement(element))) {
      fail(`SDK invocation of ${exportName} uses a spread argument`);
      return;
    }
    add(exportName, args.elements.length);
  });
  return arities;
}

const {
  calls: coreCalls,
  implementations: coreImplementations,
  delegations: coreDelegations,
} = collectCoreDatabaseCalls();
const databaseInterfaceMethods = collectDatabaseInterfaceMethods();
const windowMappings = collectWindowMappings();
const workerMappings = collectWorkerMappings();
const typescriptFunctions = collectTypeScriptFunctions();

for (const methodName of databaseInterfaceMethods) {
  if (!coreImplementations.has(methodName)) {
    fail(`Core DB interface method ${methodName} has no WASM implementation`);
  } else if (
    !coreCalls.has(methodName) &&
    !coreDelegations.has(methodName) &&
    !knownCoreDatabaseNoOps.has(methodName)
  ) {
    fail(`Core DB method ${methodName} neither invokes JS nor delegates work`);
  }
}

for (const [methodName, call] of coreCalls) {
  if (!databaseInterfaceMethods.has(methodName)) {
    continue;
  }
  if (knownCoreDatabaseBridgeIssues.has(methodName)) {
    continue;
  }
  const rpcName = windowMappings.get(methodName);
  if (!rpcName) {
    fail(
      `Core DB method ${methodName} has no window mapping (${call.filename})`
    );
    continue;
  }
  const handlerName = workerMappings.get(rpcName);
  if (!handlerName) {
    fail(
      `Window DB method ${methodName} invokes unregistered RPC method ${rpcName}`
    );
    continue;
  }
  const handler = typescriptFunctions.get(handlerName);
  if (!handler) {
    fail(
      `RPC method ${rpcName} uses handler ${handlerName}, but its function was not found`
    );
    continue;
  }
  for (const arity of call.arities) {
    if (arity < handler.minimum || arity > handler.maximum) {
      fail(
        `DB arity mismatch for ${methodName}: Core sends ${arity}, ` +
          `${handlerName} accepts ${handler.minimum}-${handler.maximum}`
      );
    }
  }
}

const coreExports = collectCoreExports();
const sdkReferences = collectSdkWindowReferences();
const coreExportArities = collectCoreExportArities();
const sdkInvocationArities = collectSdkInvocationArities();
const jsOwnedSdkMethods = new Set([
  'exportDB',
  'fileMapClear',
  'fileMapSet',
  'setSqlWasmPath',
]);
for (const reference of sdkReferences) {
  if (!coreExports.has(reference) && !jsOwnedSdkMethods.has(reference)) {
    fail(`Public SDK references ${reference}, but Core does not export it`);
  }
  if (
    windowMappings.has(reference) &&
    !coreExports.has(reference) &&
    !jsOwnedSdkMethods.has(reference)
  ) {
    fail(`Public SDK method ${reference} collides with an internal DB bridge`);
  }
}

for (const [exportName, invocationArities] of sdkInvocationArities) {
  if (!coreExports.has(exportName)) {
    continue;
  }
  if (exportName === 'commonEventFunc') {
    continue;
  }
  const expectedArity = coreExportArities.get(exportName);
  if (expectedArity === undefined) {
    fail(`Could not determine Core argument count for export ${exportName}`);
    continue;
  }
  for (const invocationArity of invocationArities) {
    if (invocationArity !== expectedArity) {
      fail(
        `SDK arity mismatch for ${exportName}: sends ${invocationArity}, ` +
          `Core expects ${expectedArity}`
      );
    }
  }
}

const packageJSON = JSON.parse(
  fs.readFileSync(path.join(projectDir, 'package.json'), 'utf8')
);
const packageLock = JSON.parse(
  fs.readFileSync(path.join(projectDir, 'package-lock.json'), 'utf8')
);
const assetVersion = fs
  .readFileSync(path.join(projectDir, 'assets', 'version'), 'utf8')
  .trim()
  .replace(/^v/, '');
const coreVersion = fs
  .readFileSync(path.join(coreDir, 'version', 'version'), 'utf8')
  .trim()
  .replace(/^v/, '');
const packageVersions = new Map([
  ['package.json', packageJSON.version],
  ['package-lock.json', packageLock.version],
  ['package-lock root package', packageLock.packages[''].version],
]);
for (const [source, version] of packageVersions) {
  if (version !== packageJSON.version) {
    fail(`${source} is ${version}, expected ${packageJSON.version}`);
  }
}
if (assetVersion !== coreVersion) {
  fail(
    `assets/version is ${assetVersion}, expected Core version ${coreVersion}`
  );
}

const wasm = fs.readFileSync(path.join(projectDir, 'assets', 'openIM.wasm'));
if (!wasm.includes(Buffer.from(`v${assetVersion}`))) {
  fail(`assets/openIM.wasm does not embed v${assetVersion}`);
}
for (const exportedName of coreExports) {
  if (!wasm.includes(Buffer.from(exportedName))) {
    fail(`assets/openIM.wasm does not contain Core export ${exportedName}`);
  }
}

if (failures.length > 0) {
  console.error(failures.map(message => `- ${message}`).join('\n'));
  process.exit(1);
}

console.log(
  `Contract OK: ${databaseInterfaceMethods.size} Core DB methods, ` +
    `${sdkReferences.size} SDK window calls, ${coreExports.size} Core exports, ` +
    `package ${packageJSON.version}, Core ${coreVersion}`
);
