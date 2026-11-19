/**
 * End-to-End Plang -> PLANARIA Holographic Binary (.hbin) Compiler Pipeline
 *
 * Stages:
 *   1. Lexing (tokenize)
 *   2. Parsing (parsePlang -> Multi-Stratum AST)
 *   3. Multi-Stratum PVM-32 Bytecode Generation (generateCode)
 *   4. Cauchy MDS GF(2^8) Encoding + Depth-8 SHA-256 Merkle Tree + Interleaved RS(254,238) Armor (encodeHbin)
 */

import { tokenize } from './lexer.js';
import { parsePlang } from './parser.js';
import { generateCode } from './codegen.js';
import { encodeHbin } from '../core/hbin.js';

export function compilePlangToHbin(source, extraMeta = {}) {
  const tokens = tokenize(source);
  const ast = parsePlang(tokens);
  const codegen = generateCode(ast);

  const encoded = encodeHbin({
    name: codegen.name,
    bundles: codegen.bundles,
    metadata: {
      compiler: 'plang-1.0.0',
      totalInstructions: codegen.totalInstructions,
      totalCodeBytes: codegen.totalCodeBytes,
      bundleStats: codegen.report,
      ...extraMeta,
    },
  });

  return {
    ...encoded,
    name: codegen.name,
    codegen,
    rawBundles: codegen.bundles,
  };
}
