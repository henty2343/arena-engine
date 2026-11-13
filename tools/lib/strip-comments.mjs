/* tools/lib/strip-comments.mjs — comment-aware JavaScript tokenizer/normalizer.
 * Shared by gen-codemap and the comment-only proof kit. Bare Node, no dependencies.
 * Regex-vs-division is a heuristic; strip-hash cross-checks with vm.Script and pair-proof.
 */
const KW = new Set([
  "return",
  "typeof",
  "case",
  "in",
  "of",
  "delete",
  "void",
  "throw",
  "new",
  "else",
  "do",
  "instanceof",
  "yield",
  "await",
]);
export function scan(src) {
  const comments = [];
  let i = 0;
  const n = src.length;
  let prev = "";
  const tstack = [];
  let depth = 0;
  const isIdStart = (c) => /[A-Za-z_$]/.test(c),
    isId = (c) => /[A-Za-z0-9_$]/.test(c);
  function readTemplate() {
    while (i < n) {
      const c = src[i];
      if (c === "\\") {
        i += 2;
        continue;
      }
      if (c === "`") {
        i++;
        return "end";
      }
      if (c === "$" && src[i + 1] === "{") {
        i += 2;
        return "expr";
      }
      i++;
    }
    return "eof";
  }
  while (i < n) {
    const c = src[i],
      d = src[i + 1];
    if (c === " " || c === "\t" || c === "\n" || c === "\r") {
      i++;
      continue;
    }
    if (c === "/" && d === "/") {
      const s = i;
      while (i < n && src[i] !== "\n") i++;
      comments.push({ s, e: i, kind: "line" });
      continue;
    }
    if (c === "/" && d === "*") {
      const s = i;
      i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i++;
      i += 2;
      comments.push({ s, e: i, kind: "block" });
      continue;
    }
    if (c === '"' || c === "'") {
      const q = c;
      i++;
      while (i < n && src[i] !== q) {
        if (src[i] === "\\") i++;
        i++;
      }
      i++;
      prev = "str";
      continue;
    }
    if (c === "`") {
      i++;
      const r = readTemplate();
      if (r === "expr") {
        tstack.push(depth);
        depth = 0;
        prev = "op";
      } else prev = "str";
      continue;
    }
    if (c === "{") {
      depth++;
      prev = "op";
      i++;
      continue;
    }
    if (c === "}") {
      if (tstack.length && depth === 0) {
        depth = tstack.pop();
        const r = readTemplate();
        if (r === "expr") {
          tstack.push(depth);
          depth = 0;
          prev = "op";
        } else prev = "str";
        continue;
      }
      depth--;
      prev = "close";
      i++;
      continue;
    }
    if (c === "/") {
      const regexOk =
        prev === "op" || prev === "" || prev === "kw" || prev === "(";
      if (regexOk) {
        i++;
        let cls = false;
        while (i < n) {
          const x = src[i];
          if (x === "\\") {
            i += 2;
            continue;
          }
          if (x === "[") cls = true;
          else if (x === "]") cls = false;
          else if (x === "/" && !cls) break;
          else if (x === "\n") break;
          i++;
        }
        i++;
        while (i < n && isId(src[i])) i++;
        prev = "str";
        continue;
      }
      i++;
      prev = "op";
      continue;
    }
    if (isIdStart(c)) {
      const s = i;
      while (i < n && isId(src[i])) i++;
      prev = KW.has(src.slice(s, i)) ? "kw" : "id";
      continue;
    }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(d || ""))) {
      while (i < n && /[0-9A-Za-z_.]/.test(src[i])) {
        if (
          (src[i] === "e" || src[i] === "E") &&
          (src[i + 1] === "+" || src[i + 1] === "-")
        )
          i++;
        i++;
      }
      prev = "num";
      continue;
    }
    if (c === ")" || c === "]") {
      prev = "close";
      i++;
      continue;
    }
    if ("([,;:=!&|?+-*%<>~^".includes(c)) {
      prev = c === "(" ? "(" : "op";
      i++;
      continue;
    }
    i++;
  }
  return comments;
}
export function strip(src, cs = scan(src)) {
  let out = "",
    last = 0;
  for (const c of cs) {
    out += src.slice(last, c.s) + src.slice(c.s, c.e).replace(/[^\n]/g, " ");
    last = c.e;
  }
  return out + src.slice(last);
}
/* Normalized code fingerprint: comments removed, trailing whitespace trimmed,
 * whitespace-only lines dropped. Indentation and string/regex/template contents stay. */
export function normalizeCode(src) {
  return strip(src)
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/, ""))
    .filter((l) => l.trim().length > 0)
    .join("\n");
}
