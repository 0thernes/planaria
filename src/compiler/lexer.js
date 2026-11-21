/**
 * Plang Lexer — Tokenizer for the PLANARIA Holographic Systems Language
 */

const KEYWORDS = new Set([
  'program', 'const', 'bundle', 'fn', 'let', 'if', 'else', 'while', 'return', 'mem', 'organ_call',
]);

export function tokenize(source) {
  const tokens = [];
  let i = 0;
  let line = 1;
  let col = 1;
  const len = source.length;

  function peek(offset = 0) {
    return i + offset < len ? source[i + offset] : '';
  }

  function advance() {
    const ch = source[i++];
    if (ch === '\n') { line++; col = 1; } else { col++; }
    return ch;
  }

  while (i < len) {
    const ch = peek();

    // Whitespace
    if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
      advance();
      continue;
    }

    // Line comment //
    if (ch === '/' && peek(1) === '/') {
      while (i < len && peek() !== '\n') advance();
      continue;
    }

    // Block comment /* ... */
    if (ch === '/' && peek(1) === '*') {
      const cLine = line;
      const cCol = col;
      advance(); advance();
      while (i < len && !(peek() === '*' && peek(1) === '/')) advance();
      if (i >= len) {
        throw new SyntaxError(`Unterminated block comment starting at ${cLine}:${cCol}`);
      }
      advance(); advance();
      continue;
    }

    const startLine = line;
    const startCol = col;

    // String literal (for 4-char label tags like "AEGI")
    if (ch === '"') {
      advance();
      let str = '';
      while (i < len && peek() !== '"') {
        if (peek() === '\\') {
          advance();
          if (i >= len) {
            throw new SyntaxError(`Unterminated string escape at ${startLine}:${startCol}`);
          }
          const esc = advance();
          const escMap = { n: '\n', t: '\t', r: '\r', '0': '\0', '\\': '\\', '"': '"' };
          str += Object.prototype.hasOwnProperty.call(escMap, esc) ? escMap[esc] : esc;
        } else {
          str += advance();
        }
      }
      if (peek() !== '"') throw new SyntaxError(`Unterminated string at ${startLine}:${startCol}`);
      advance();
      tokens.push({ type: 'STRING', value: str, line: startLine, col: startCol });
      continue;
    }

    // Numbers (decimal or 0x hex)
    if (ch >= '0' && ch <= '9') {
      let numStr = '';
      if (ch === '0' && (peek(1) === 'x' || peek(1) === 'X')) {
        numStr += advance() + advance();
        const hexStart = numStr.length;
        while (i < len && /[0-9a-fA-F]/.test(peek())) numStr += advance();
        if (numStr.length === hexStart) {
          throw new SyntaxError(`Invalid hexadecimal literal '${numStr}' at ${startLine}:${startCol}`);
        }
        if (i < len && /[a-zA-Z_]/.test(peek())) {
          throw new SyntaxError(`Invalid trailing identifier after hex literal '${numStr}' at ${startLine}:${startCol}`);
        }
        const parsed = parseInt(numStr, 16);
        if (!Number.isSafeInteger(parsed) || parsed > 0xffffffff) {
          throw new SyntaxError(`Hex literal '${numStr}' exceeds 32-bit integer range at ${startLine}:${startCol}`);
        }
        tokens.push({ type: 'NUMBER', value: parsed | 0, line: startLine, col: startCol });
      } else {
        while (i < len && peek() >= '0' && peek() <= '9') numStr += advance();
        if (i < len && /[a-zA-Z_]/.test(peek())) {
          throw new SyntaxError(`Invalid trailing identifier after numeric literal '${numStr}' at ${startLine}:${startCol}`);
        }
        const parsed = parseInt(numStr, 10);
        if (!Number.isSafeInteger(parsed) || parsed > 0xffffffff) {
          throw new SyntaxError(`Numeric literal '${numStr}' exceeds 32-bit integer range at ${startLine}:${startCol}`);
        }
        tokens.push({ type: 'NUMBER', value: parsed | 0, line: startLine, col: startCol });
      }
      continue;
    }

    // Identifiers & keywords
    if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_') {
      let id = '';
      while (i < len && /[a-zA-Z0-9_]/.test(peek())) id += advance();
      tokens.push({
        type: KEYWORDS.has(id) ? 'KEYWORD' : 'IDENT',
        value: id,
        line: startLine,
        col: startCol,
      });
      continue;
    }

    // Two-character operators
    const two = ch + peek(1);
    if (['==', '!=', '<=', '>=', '<<', '>>', '&&', '||', '+=', '-='].includes(two)) {
      advance(); advance();
      tokens.push({ type: 'OP', value: two, line: startLine, col: startCol });
      continue;
    }

    // Single-character punctuation & operators
    if ('+-*/%&|^~<>!=;:,(){}[]?'.includes(ch)) {
      advance();
      tokens.push({ type: 'PUNCT', value: ch, line: startLine, col: startCol });
      continue;
    }

    throw new SyntaxError(`Unexpected character '${ch}' at ${startLine}:${startCol}`);
  }

  tokens.push({ type: 'EOF', value: '', line, col });
  return tokens;
}
