/**
 * Plang Recursive-Descent Parser -> Typed Multi-Stratum AST
 *
 * Grammar highlights:
 *   program <NAME>;
 *   const <IDENT> = <expr>;
 *   bundle <BUNDLE_NAME> { (fn <name>(args...) { ... } | stmt)* }
 *
 * Expressions support full integer arithmetic, bitwise ops, shifts, comparisons,
 * logical && / ||, mem[expr], syscalls, local user functions, and organ_call(ORGAN, maxS).
 */

const MAX_PARSE_DEPTH = 128;

export function parsePlang(tokens) {
  if (!Array.isArray(tokens) || tokens.length === 0 || tokens[tokens.length - 1]?.type !== 'EOF') {
    throw new SyntaxError('parsePlang expects a non-empty token array terminated by EOF');
  }
  let pos = 0;
  let depth = 0;

  function withDepth(fn) {
    if (++depth > MAX_PARSE_DEPTH) {
      const t = peek();
      throw new SyntaxError(`Parse nesting exceeded limit (${MAX_PARSE_DEPTH}) at ${t.line}:${t.col}`);
    }
    try {
      return fn();
    } finally {
      depth--;
    }
  }

  function peek(offset = 0) {
    return tokens[Math.min(pos + offset, tokens.length - 1)];
  }

  function advance() {
    return tokens[pos++];
  }

  function expect(type, value = null) {
    const t = peek();
    if (t.type !== type || (value !== null && t.value !== value)) {
      throw new SyntaxError(
        `Parse error at ${t.line}:${t.col}: expected ${type}${value ? ` '${value}'` : ''}, got ${t.type} '${t.value}'`
      );
    }
    return advance();
  }

  function match(type, value = null) {
    const t = peek();
    if (t.type === type && (value === null || t.value === value)) {
      advance();
      return t;
    }
    return null;
  }

  function parseProgram() {
    let name = 'UNNAMED';
    const consts = [];
    const bundles = [];

    if (match('KEYWORD', 'program')) {
      name = expect('IDENT').value;
      expect('PUNCT', ';');
    }

    while (peek().type !== 'EOF') {
      if (match('KEYWORD', 'const')) {
        const cname = expect('IDENT').value;
        expect('PUNCT', '=');
        const expr = parseExpr();
        expect('PUNCT', ';');
        consts.push({ name: cname, expr });
      } else if (match('KEYWORD', 'bundle')) {
        const bname = expect('IDENT').value;
        expect('PUNCT', '{');
        const funcs = [];
        const body = [];
        while (!match('PUNCT', '}')) {
          if (peek().type === 'KEYWORD' && peek().value === 'fn') {
            funcs.push(parseFn());
          } else {
            body.push(parseStmt());
          }
        }
        bundles.push({ name: bname, funcs, body });
      } else {
        const t = peek();
        throw new SyntaxError(`Unexpected top-level token '${t.value}' at ${t.line}:${t.col}`);
      }
    }

    return { type: 'Program', name, consts, bundles };
  }

  function parseFn() {
    expect('KEYWORD', 'fn');
    const name = expect('IDENT').value;
    expect('PUNCT', '(');
    const params = [];
    if (!match('PUNCT', ')')) {
      do {
        params.push(expect('IDENT').value);
      } while (match('PUNCT', ','));
      expect('PUNCT', ')');
    }
    const body = parseBlock();
    return { type: 'FnDecl', name, params, body };
  }

  function parseBlock() {
    return withDepth(() => {
      expect('PUNCT', '{');
      const stmts = [];
      while (!match('PUNCT', '}')) {
        stmts.push(parseStmt());
      }
      return { type: 'Block', stmts };
    });
  }

  function parseStmt() {
    const t = peek();

    if (t.type === 'PUNCT' && t.value === '{') {
      return parseBlock();
    }

    if (t.type === 'KEYWORD' && t.value === 'let') {
      advance();
      const name = expect('IDENT').value;
      expect('PUNCT', '=');
      const init = parseExpr();
      expect('PUNCT', ';');
      return { type: 'LetStmt', name, init };
    }

    if (t.type === 'KEYWORD' && t.value === 'if') {
      advance();
      expect('PUNCT', '(');
      const cond = parseExpr();
      expect('PUNCT', ')');
      const thenBranch = parseBlock();
      let elseBranch = null;
      if (match('KEYWORD', 'else')) {
        if (peek().type === 'KEYWORD' && peek().value === 'if') {
          elseBranch = withDepth(() => parseStmt());
        } else {
          elseBranch = parseBlock();
        }
      }
      return { type: 'IfStmt', cond, thenBranch, elseBranch };
    }

    if (t.type === 'KEYWORD' && t.value === 'while') {
      advance();
      expect('PUNCT', '(');
      const cond = parseExpr();
      expect('PUNCT', ')');
      const body = parseBlock();
      return { type: 'WhileStmt', cond, body };
    }

    if (t.type === 'KEYWORD' && t.value === 'return') {
      advance();
      let value = null;
      if (!(peek().type === 'PUNCT' && peek().value === ';')) {
        value = parseExpr();
      }
      expect('PUNCT', ';');
      return { type: 'ReturnStmt', value };
    }

    // mem[idx] = expr; or mem[idx] += expr; or mem[idx] expression statement
    if (t.type === 'KEYWORD' && t.value === 'mem') {
      const savedPos = pos;
      advance();
      expect('PUNCT', '[');
      const index = parseExpr();
      expect('PUNCT', ']');
      const opTok = peek();
      if (opTok.type === 'PUNCT' && opTok.value === '=') {
        advance();
        const value = parseExpr();
        expect('PUNCT', ';');
        return { type: 'MemStore', index, value };
      }
      if (opTok.type === 'OP' && (opTok.value === '+=' || opTok.value === '-=')) {
        advance();
        const rhs = parseExpr();
        expect('PUNCT', ';');
        const binOp = opTok.value === '+=' ? '+' : '-';
        // Dedicated MemCompoundAssign guarantees `index` is evaluated strictly once!
        return { type: 'MemCompoundAssign', op: binOp, index, rhs };
      }
      // Rewind and parse as general expression statement (e.g., mem[0] ? f() : g();)
      pos = savedPos;
    }

    // Variable assignment: x = expr; or x += expr; or x -= expr;
    if (t.type === 'IDENT') {
      const next = peek(1);
      if (next.type === 'PUNCT' && next.value === '=') {
        advance(); advance();
        const value = parseExpr();
        expect('PUNCT', ';');
        return { type: 'AssignStmt', name: t.value, value };
      }
      if (next.type === 'OP' && (next.value === '+=' || next.value === '-=')) {
        advance(); advance();
        const rhs = parseExpr();
        expect('PUNCT', ';');
        return {
          type: 'AssignStmt',
          name: t.value,
          value: { type: 'Binary', op: next.value === '+=' ? '+' : '-', left: { type: 'Ident', name: t.value }, right: rhs },
        };
      }
    }

    // Expression statement (e.g. syscall or organ_call)
    const expr = parseExpr();
    expect('PUNCT', ';');
    return { type: 'ExprStmt', expr };
  }

  function parseExpr() { return parseTernary(); }

  function parseTernary() {
    let cond = parseLogicalOr();
    if (match('PUNCT', '?')) {
      return withDepth(() => {
        const thenExpr = parseExpr();
        expect('PUNCT', ':');
        const elseExpr = parseExpr();
        return { type: 'Ternary', cond, thenExpr, elseExpr };
      });
    }
    return cond;
  }

  function parseLogicalOr() {
    let left = parseLogicalAnd();
    while (match('OP', '||')) {
      left = { type: 'Binary', op: '||', left, right: parseLogicalAnd() };
    }
    return left;
  }

  function parseLogicalAnd() {
    let left = parseBitOr();
    while (match('OP', '&&')) {
      left = { type: 'Binary', op: '&&', left, right: parseBitOr() };
    }
    return left;
  }

  function parseBitOr() {
    let left = parseBitXor();
    while (match('PUNCT', '|')) {
      left = { type: 'Binary', op: '|', left, right: parseBitXor() };
    }
    return left;
  }

  function parseBitXor() {
    let left = parseBitAnd();
    while (match('PUNCT', '^')) {
      left = { type: 'Binary', op: '^', left, right: parseBitAnd() };
    }
    return left;
  }

  function parseBitAnd() {
    let left = parseEquality();
    while (match('PUNCT', '&')) {
      left = { type: 'Binary', op: '&', left, right: parseEquality() };
    }
    return left;
  }

  function parseEquality() {
    let left = parseRelational();
    while (peek().type === 'OP' && (peek().value === '==' || peek().value === '!=')) {
      const op = advance().value;
      left = { type: 'Binary', op, left, right: parseRelational() };
    }
    return left;
  }

  function parseRelational() {
    let left = parseShift();
    while (
      (peek().type === 'PUNCT' && (peek().value === '<' || peek().value === '>')) ||
      (peek().type === 'OP' && (peek().value === '<=' || peek().value === '>='))
    ) {
      const op = advance().value;
      left = { type: 'Binary', op, left, right: parseShift() };
    }
    return left;
  }

  function parseShift() {
    let left = parseAdditive();
    while (peek().type === 'OP' && (peek().value === '<<' || peek().value === '>>')) {
      const op = advance().value;
      left = { type: 'Binary', op, left, right: parseAdditive() };
    }
    return left;
  }

  function parseAdditive() {
    let left = parseMultiplicative();
    while (peek().type === 'PUNCT' && (peek().value === '+' || peek().value === '-')) {
      const op = advance().value;
      left = { type: 'Binary', op, left, right: parseMultiplicative() };
    }
    return left;
  }

  function parseMultiplicative() {
    let left = parseUnary();
    while (peek().type === 'PUNCT' && (peek().value === '*' || peek().value === '/' || peek().value === '%')) {
      const op = advance().value;
      left = { type: 'Binary', op, left, right: parseUnary() };
    }
    return left;
  }

  function parseUnary() {
    return withDepth(() => {
      if (match('PUNCT', '-')) {
        const nextTok = peek();
        if (nextTok.type === 'NUMBER' && !nextTok.isHex) {
          if (nextTok.rawValue > 0x80000000) {
            throw new SyntaxError(`Negated decimal literal '-${nextTok.rawValue}' exceeds signed 32-bit integer range at ${nextTok.line}:${nextTok.col}`);
          }
          if (nextTok.rawValue === 0x80000000) {
            advance();
            return { type: 'Number', value: -2147483648 };
          }
        }
        const operand = parseUnary();
        if (operand.type === 'Number') return { type: 'Number', value: (-operand.value) | 0 };
        return { type: 'Binary', op: '-', left: { type: 'Number', value: 0 }, right: operand };
      }
      if (match('PUNCT', '!')) {
        return { type: 'Binary', op: '==', left: parseUnary(), right: { type: 'Number', value: 0 } };
      }
      if (match('PUNCT', '~')) {
        const operand = parseUnary();
        if (operand.type === 'Number') return { type: 'Number', value: (~operand.value) | 0 };
        return { type: 'Binary', op: '^', left: operand, right: { type: 'Number', value: -1 } };
      }
      return parsePrimary();
    });
  }

  function parsePrimary() {
    const t = peek();

    if (t.type === 'NUMBER') {
      if (!t.isHex && t.rawValue > 0x7fffffff) {
        throw new SyntaxError(`Decimal literal '${t.rawValue}' exceeds signed 32-bit max (2147483647); use hex 0x... for unsigned 32-bit bit patterns at ${t.line}:${t.col}`);
      }
      advance();
      return { type: 'Number', value: t.value };
    }

    if (t.type === 'STRING') {
      advance();
      return { type: 'String', value: t.value };
    }

    if (match('PUNCT', '(')) {
      const e = parseExpr();
      expect('PUNCT', ')');
      return e;
    }

    if (t.type === 'KEYWORD' && t.value === 'mem') {
      advance();
      expect('PUNCT', '[');
      const index = parseExpr();
      expect('PUNCT', ']');
      return { type: 'MemLoad', index };
    }

    if (t.type === 'KEYWORD' && t.value === 'organ_call') {
      advance();
      expect('PUNCT', '(');
      const organName = expect('IDENT').value;
      expect('PUNCT', ',');
      const maxStratum = parseExpr();
      expect('PUNCT', ')');
      return { type: 'OrganCall', organName, maxStratum };
    }

    if (t.type === 'IDENT') {
      advance();
      if (match('PUNCT', '(')) {
        const args = [];
        if (!match('PUNCT', ')')) {
          do {
            args.push(parseExpr());
          } while (match('PUNCT', ','));
          expect('PUNCT', ')');
        }
        return { type: 'Call', name: t.value, args };
      }
      return { type: 'Ident', name: t.value };
    }

    throw new SyntaxError(`Unexpected expression token ${t.type} '${t.value}' at ${t.line}:${t.col}`);
  }

  return parseProgram();
}
