import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createTranslator } from 'next-intl';

const MESSAGES_DIR = join(process.cwd(), 'messages');

function loadEnglishLeaves(): Map<string, string> {
  const out = new Map<string, string>();
  const walk = (node: unknown, path: string) => {
    if (node && typeof node === 'object' && !Array.isArray(node)) {
      for (const [k, v] of Object.entries(node)) {
        walk(v, path ? `${path}.${k}` : k);
      }
      return;
    }
    out.set(path, typeof node === 'string' ? node : String(node));
  };
  walk(JSON.parse(readFileSync(join(MESSAGES_DIR, 'en.json'), 'utf8')), '');
  return out;
}

// Keep the local signature tokenizer aligned with next-intl's ICU parser.

type Signature = { args: string[]; tags: string[] };

class IcuParseError extends Error {}

function icuSignature(message: string): Signature {
  const args = new Set<string>();
  const tags = new Set<string>();
  let i = 0;
  const len = message.length;

  const fail = (why: string): never => {
    throw new IcuParseError(
      `${why} at offset ${i} in ${JSON.stringify(message)}`
    );
  };
  const peek = () => message[i];
  const skipWs = () => {
    while (i < len && /\s/.test(message[i])) i++;
  };
  const readIdent = () => {
    const m = /^[A-Za-z0-9_]+/.exec(message.slice(i));
    if (!m) return '';
    i += m[0].length;
    return m[0];
  };

  // Parses literal text and nested elements until an unmatched `}` (left
  // unconsumed) or end of input. `inPlural` makes `#` quotable, as in ICU.
  const parseMessage = (depth: number, inPlural: boolean) => {
    while (i < len) {
      const ch = peek();
      if (ch === "'") {
        const next = message[i + 1];
        if (next === "'") {
          i += 2;
          continue;
        }
        // An apostrophe only starts a quoted literal when it precedes a
        // syntax character; otherwise it's just an apostrophe (can't, it's).
        if (
          next === '{' ||
          next === '}' ||
          next === '<' ||
          next === '>' ||
          (inPlural && next === '#')
        ) {
          i++;
          while (i < len) {
            if (peek() === "'") {
              if (message[i + 1] === "'") {
                i += 2;
                continue;
              }
              i++;
              break;
            }
            i++;
          }
          continue;
        }
        i++;
        continue;
      }
      if (ch === '{') {
        i++;
        parseArgument(depth, inPlural);
        continue;
      }
      if (ch === '}') {
        if (depth === 0) fail('unmatched }');
        return;
      }
      if (ch === '<' && /[A-Za-z/]/.test(message[i + 1] ?? '')) {
        parseTag(depth, inPlural);
        continue;
      }
      i++;
    }
  };

  const parseArgument = (depth: number, inPlural: boolean) => {
    skipWs();
    const name = readIdent();
    if (!name) fail('expected argument name');
    skipWs();
    if (peek() === '}') {
      i++;
      args.add(name);
      return;
    }
    if (peek() !== ',') fail('expected , or } after argument name');
    i++;
    skipWs();
    const type = readIdent();
    if (!type) fail('expected argument type');
    skipWs();
    if (peek() === '}') {
      i++;
      args.add(name);
      return;
    }
    if (peek() !== ',') fail('expected , or } after argument type');
    i++;
    skipWs();

    if (type === 'plural' || type === 'selectordinal' || type === 'select') {
      if (message.startsWith('offset:', i)) {
        i += 'offset:'.length;
        skipWs();
        if (!readIdent()) fail('expected offset value');
        skipWs();
      }
      const options: string[] = [];
      while (i < len && peek() !== '}') {
        const m = /^[^\s{}]+/.exec(message.slice(i));
        if (!m) return fail('expected plural/select option selector');
        i += m[0].length;
        skipWs();
        if (peek() !== '{') fail('expected { after option selector');
        i++;
        parseMessage(depth + 1, inPlural || type !== 'select');
        if (peek() !== '}') fail('unterminated option');
        i++;
        skipWs();
        options.push(m[0]);
      }
      if (i >= len) fail('unterminated plural/select');
      i++;
      if (options.length === 0) fail('plural/select without options');
      args.add(name);
      return;
    }

    // number/date/time with a style or skeleton: opaque up to the closing brace.
    while (i < len && peek() !== '}') i++;
    if (i >= len) fail('unterminated argument style');
    i++;
    args.add(name);
  };

  const parseTag = (depth: number, inPlural: boolean) => {
    i++; // <
    if (peek() === '/') {
      // Closing tag: the opening tag already recorded the name.
      const end = message.indexOf('>', i);
      if (end === -1) fail('unterminated closing tag');
      i = end + 1;
      return;
    }
    const name = /^[A-Za-z][\w-]*/.exec(message.slice(i));
    if (!name) return fail('expected tag name');
    i += name[0].length;
    if (message.startsWith('/>', i)) {
      i += 2;
      tags.add(name[0]);
      return;
    }
    // next-intl / formatjs tags carry no attributes — `<strong class="x">`
    // is INVALID_TAG there too, and such strings go through t.raw().
    if (peek() !== '>') fail('tag attributes are not ICU');
    i++;
    tags.add(name[0]);
    parseMessage(depth, inPlural);
    // Children stop at an unmatched `}` (our caller's) or end of input;
    // the closing tag itself is consumed by the loop above when reached.
  };

  parseMessage(0, false);
  return { args: [...args].sort(), tags: [...tags].sort() };
}

function tryIcuSignature(message: string): Signature | null {
  try {
    return icuSignature(message);
  } catch (err) {
    if (err instanceof IcuParseError) return null;
    throw err;
  }
}

/** Does next-intl's own parser accept this string? Mirrors icu-safety.test.ts. */
function nextIntlParses(message: string): boolean {
  let code = '';
  const t = createTranslator({
    locale: 'en',
    messages: { probe: message },
    onError: (err) => {
      code = err.code;
    },
  });
  t('probe' as never);
  return code !== 'INVALID_MESSAGE';
}

describe('English message catalogue', () => {
  const sourceLeaves = loadEnglishLeaves();

  it('the signature tokenizer agrees with next-intl on which en strings are ICU', () => {
    // Guard the guard: if our tokenizer accepted something next-intl
    // rejects (or vice versa) the check below would compare the wrong
    // thing. Both must classify every English string identically.
    const disagreements = [...sourceLeaves]
      .filter(
        ([, value]) =>
          (tryIcuSignature(value) !== null) !== nextIntlParses(value)
      )
      .map(([key, value]) => `${key}: ${value}`);
    expect(disagreements).toEqual([]);
    // …and there must be ICU strings with arguments at all, or the
    // check is vacuous.
    const withArgs = [...sourceLeaves.values()].filter(
      (v) => (tryIcuSignature(v)?.args.length ?? 0) > 0
    );
    expect(withArgs.length).toBeGreaterThan(100);
  });
});
