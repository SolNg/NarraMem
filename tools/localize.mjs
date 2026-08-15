/**
 * NarraMem Vietnamese localization tool.
 *
 * Upstream ships only a minified bundle, so the translation is applied by
 * rewriting string literals inside `dist/index.js`. Literals are located with
 * acorn rather than by pattern matching: the bundle is full of regex literals
 * containing quote characters, which a text scanner cannot tell apart from
 * string delimiters.
 *
 * Template literals are normalized to a positional-placeholder form before
 * lookup, so the translation table never has to mention minified identifiers:
 *
 *     `楼层 ${a.id} 缺失`   ->   "楼层 {0} 缺失"
 *
 * Usage:
 *   node tools/localize.mjs extract [file]   dump every translatable pattern
 *   node tools/localize.mjs apply            rewrite dist/index.js in place
 *   node tools/localize.mjs check            report coverage, change nothing
 */

import { readFileSync, writeFileSync } from "node:fs";
import { argv, exit } from "node:process";

import { parse } from "acorn";

import { PATCHES } from "./patches.mjs";
import { FILE_OVERRIDES, KEEP_PREFIXES, TRANSLATIONS } from "./translations.mjs";

const BUNDLE = "dist/index.js";
const CJK = /[一-鿿]/u;

/**
 * A literal is translatable when it holds Chinese text, or when a file override
 * names it explicitly. The second case matters for the editable envelope
 * defaults, which are already English and would otherwise be invisible here.
 */
function isTarget(text) {
  return CJK.test(text) || FILE_OVERRIDES.some((override) => text.startsWith(override.prefix));
}

/** Collect every translatable string literal and template literal. */
function collectNodes(source) {
  const ast = parse(source, {
    ecmaVersion: "latest",
    sourceType: "module",
    allowHashBang: true,
  });
  const found = [];
  const seen = new Set();

  const visit = (node, ancestors) => {
    if (node === null || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const child of node) visit(child, ancestors);
      return;
    }
    if (typeof node.type !== "string") return;

    if (node.type === "Literal" && typeof node.value === "string" && isTarget(node.value)) {
      found.push({ kind: "string", node, ancestors: [...ancestors] });
    } else if (node.type === "TemplateLiteral") {
      const text = node.quasis.map((quasi) => quasi.value.cooked ?? "").join("");
      if (isTarget(text)) found.push({ kind: "template", node, ancestors: [...ancestors] });
    }

    const next = [...ancestors, node];
    for (const key of Object.keys(node)) {
      if (key === "type" || key === "start" || key === "end" || key === "loc") continue;
      const child = node[key];
      if (child !== null && typeof child === "object" && !seen.has(child)) {
        seen.add(child);
        visit(child, next);
      }
    }
  };

  visit(ast, []);
  found.sort((left, right) => left.node.start - right.node.start);
  return found;
}

/** Reduce a node to its lookup pattern, where `{i}` marks an interpolation. */
function patternOf(entry) {
  if (entry.kind === "string") return entry.node.value;
  const { quasis, expressions } = entry.node;
  let pattern = "";
  for (const [index, quasi] of quasis.entries()) {
    pattern += quasi.value.cooked ?? "";
    if (index < expressions.length) pattern += `{${index}}`;
  }
  return pattern;
}

/** Render a translated pattern back into JavaScript source. */
function render(entry, translated, expressions) {
  if (entry.kind === "string") return JSON.stringify(translated);

  // Split on placeholders, keeping the order the translation actually uses so a
  // Vietnamese sentence may reorder the interpolations.
  const pieces = [];
  const used = [];
  let rest = translated;
  for (;;) {
    const match = /\{(\d+)\}/u.exec(rest);
    if (match === null) break;
    pieces.push(rest.slice(0, match.index));
    used.push(Number(match[1]));
    rest = rest.slice(match.index + match[0].length);
  }
  pieces.push(rest);

  if (used.length !== expressions.length) {
    throw new Error(
      `placeholder count mismatch (${used.length} vs ${expressions.length}) in: ${translated}`,
    );
  }
  for (const index of used) {
    if (index >= expressions.length) throw new Error(`unknown placeholder {${index}}`);
  }

  const escape = (text) => text.replace(/\\/gu, "\\\\").replace(/`/gu, "\\`").replace(/\$\{/gu, "\\${");
  let out = "`";
  for (const [index, piece] of pieces.entries()) {
    out += escape(piece);
    if (index < used.length) out += `\${${expressions[used[index]]}}`;
  }
  return `${out}\``;
}

/**
 * Split entries into the outermost ones and, for each, the entries nested in its
 * interpolations. `` `事件 · ${x ?? "未分类"}` `` is two translatable literals: the
 * template and the default string inside its expression. Rewriting is therefore
 * recursive — an outer node is rendered from expression source that already has
 * its own nested replacements applied.
 */
function outermost(entries) {
  const roots = [];
  let cursor = -1;
  for (const entry of entries) {
    if (entry.node.start >= cursor) {
      roots.push(entry);
      cursor = entry.node.end;
    }
  }
  return roots;
}

function loadBundle(file) {
  const source = readFileSync(file, "utf8");
  return { source, entries: collectNodes(source) };
}

/**
 * Resolve a pattern to `"keep"`, a replacement string, or `undefined`.
 *
 * Prompt bodies are matched on a unique prefix and their replacement lives in a
 * file, so multi-paragraph documents never have to be inlined as object keys.
 */
function lookup(pattern) {
  for (const override of FILE_OVERRIDES) {
    if (pattern.startsWith(override.prefix)) return readFileSync(override.file, "utf8");
  }
  const exact = TRANSLATIONS[pattern];
  if (exact !== undefined) return exact;
  for (const prefix of KEEP_PREFIXES) {
    if (pattern.startsWith(prefix)) return "keep";
  }
  return undefined;
}

const command = argv[2] ?? "check";

if (command === "extract") {
  const { entries } = loadBundle(argv[3] ?? BUNDLE);
  const counts = new Map();
  for (const entry of entries) {
    const pattern = patternOf(entry);
    counts.set(pattern, (counts.get(pattern) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => a[0].length - b[0].length);
  console.log(JSON.stringify(Object.fromEntries(sorted), null, 1));
  console.log(`\n// ${counts.size} distinct patterns, ${entries.length} occurrences`);
  exit(0);
}

const { source, entries } = loadBundle(BUNDLE);

const missing = new Map();
let translatedCount = 0;
let keptCount = 0;

for (const entry of entries) {
  const pattern = patternOf(entry);
  const resolved = lookup(pattern);
  if (resolved === "keep") keptCount += 1;
  else if (resolved === undefined) missing.set(pattern, (missing.get(pattern) ?? 0) + 1);
  else translatedCount += 1;
}

/** Rewrite `[start, end)` of the bundle, replacing any literals nested inside. */
function rewriteSpan(start, end) {
  const inside = entries.filter((entry) => entry.node.start >= start && entry.node.end <= end);
  let out = "";
  let cursor = start;
  for (const entry of outermost(inside)) {
    out += source.slice(cursor, entry.node.start) + renderEntry(entry);
    cursor = entry.node.end;
  }
  return out + source.slice(cursor, end);
}

function renderEntry(entry) {
  const pattern = patternOf(entry);
  const translated = lookup(pattern);
  if (translated === undefined || translated === "keep") return rewriteNestedOnly(entry);
  const expressions =
    entry.kind === "string"
      ? []
      : entry.node.expressions.map((expression) =>
          rewriteSpan(expression.start, expression.end),
        );
  return render(entry, translated, expressions);
}

/** Keep a literal's own text but still translate anything nested in it. */
function rewriteNestedOnly(entry) {
  if (entry.kind === "string") return source.slice(entry.node.start, entry.node.end);
  let out = "`";
  for (const [index, quasi] of entry.node.quasis.entries()) {
    out += source.slice(quasi.start, quasi.end);
    const expression = entry.node.expressions[index];
    if (expression !== undefined) out += `\${${rewriteSpan(expression.start, expression.end)}}`;
  }
  return `${out}\``;
}

console.log(`translated ${translatedCount}, kept ${keptCount}, missing ${missing.size}`);
if (missing.size > 0) {
  console.log("\nuntranslated patterns:");
  for (const [pattern, count] of missing) console.log(`  ${count}x ${JSON.stringify(pattern)}`);
}

if (command === "check") exit(missing.size === 0 ? 0 : 1);
if (command !== "apply") {
  console.error(`unknown command: ${command}`);
  exit(2);
}
if (missing.size > 0) {
  console.error("\nrefusing to apply an incomplete translation");
  exit(1);
}

let out = rewriteSpan(0, source.length);

/** Find the single class binding declaring every one of `methods`. */
function classBindingWith(text, methods) {
  const ast = parse(text, { ecmaVersion: "latest", sourceType: "module" });
  const hits = [];
  const inspect = (node, name) => {
    const declared = node.body.body.filter((m) => m.key?.name).map((m) => m.key.name);
    if (methods.every((wanted) => declared.includes(wanted))) hits.push(name);
  };
  const walk = (node) => {
    if (node === null || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(walk);
    if (node.type === "ClassDeclaration" && node.id) inspect(node, node.id.name);
    if (node.type === "VariableDeclarator" && node.init?.type === "ClassExpression") {
      inspect(node.init, node.id.name);
    }
    for (const key of Object.keys(node)) {
      if (!["type", "start", "end", "loc"].includes(key)) walk(node[key]);
    }
  };
  walk(ast);
  if (hits.length !== 1) {
    throw new Error(`expected 1 class declaring ${methods.join("/")}, found ${hits.length}`);
  }
  return hits[0];
}

for (const patch of PATCHES) {
  const matches = [...out.matchAll(new RegExp(patch.find, `${patch.find.flags}g`))];
  if (matches.length !== 1) {
    console.error(`patch ${patch.name}: anchor matched ${matches.length} times, expected 1`);
    exit(1);
  }
  const bindings = Object.fromEntries(
    Object.entries(patch.requires ?? {}).map(([key, methods]) => [
      key,
      classBindingWith(out, methods),
    ]),
  );
  const [match] = matches;
  out =
    out.slice(0, match.index) +
    patch.replace(match, bindings) +
    out.slice(match.index + match[0].length);
  const named = Object.entries(bindings).map(([key, value]) => `${key}=${value}`).join(" ");
  console.log(`patch ${patch.name}: applied${named.length > 0 ? ` (${named})` : ""}`);
}

// The rewrite must stay parseable; a broken bundle would silently disable the
// extension inside SillyTavern rather than fail loudly.
parse(out, { ecmaVersion: "latest", sourceType: "module", allowHashBang: true });
writeFileSync(BUNDLE, out);
console.log(`wrote ${BUNDLE} (${source.length} -> ${out.length} bytes)`);
