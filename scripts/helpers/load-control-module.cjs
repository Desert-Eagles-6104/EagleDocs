const ts = require("typescript");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../../src/components/ControlPlayground");
const cache = new Map();

function loadFile(filename) {
  if (cache.has(filename)) return cache.get(filename).exports;
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const module = { exports: {} };
  cache.set(filename, module);
  new Function("require", "module", "exports", outputText)(
    (specifier) =>
      loadFile(path.resolve(path.dirname(filename), specifier + ".ts")),
    module,
    module.exports,
  );
  return module.exports;
}

module.exports = (name) => loadFile(path.join(root, name + ".ts"));
