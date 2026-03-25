import * as fs from 'fs';
import * as path from 'path';

// ===================================================
// Zero-Width Characters — Unicode Codepoints
// ===================================================
const ZERO_WIDTH_CHARS: Record<string, string> = {
  '\u200B': 'ZERO WIDTH SPACE (U+200B)',
  '\u200C': 'ZERO WIDTH NON-JOINER (U+200C)',
  '\u200D': 'ZERO WIDTH JOINER (U+200D)',
  '\u200E': 'LEFT-TO-RIGHT MARK (U+200E)',
  '\u200F': 'RIGHT-TO-LEFT MARK (U+200F)',
  '\u2028': 'LINE SEPARATOR (U+2028)',
  '\u2029': 'PARAGRAPH SEPARATOR (U+2029)',
  '\u202A': 'LEFT-TO-RIGHT EMBEDDING (U+202A)',
  '\u202B': 'RIGHT-TO-LEFT EMBEDDING (U+202B)',
  '\u202C': 'POP DIRECTIONAL FORMATTING (U+202C)',
  '\u202D': 'LEFT-TO-RIGHT OVERRIDE (U+202D)',
  '\u202E': 'RIGHT-TO-LEFT OVERRIDE (U+202E)',  // ← Most dangerous (Trojan Source)
  '\u2060': 'WORD JOINER (U+2060)',
  '\u2061': 'FUNCTION APPLICATION (U+2061)',
  '\u2062': 'INVISIBLE TIMES (U+2062)',
  '\u2063': 'INVISIBLE SEPARATOR (U+2063)',
  '\u2064': 'INVISIBLE PLUS (U+2064)',
  '\uFEFF': 'ZERO WIDTH NO-BREAK SPACE / BOM (U+FEFF)',
  '\u00AD': 'SOFT HYPHEN (U+00AD)',
};

const ZWC_REGEX = new RegExp(
  Object.keys(ZERO_WIDTH_CHARS).join('|'),
  'g'
);

// ===================================================
// File Extensions to Scan
// ===================================================
const SCAN_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.json', '.mjs', '.cjs',
]);

const IGNORE_DIRS = new Set([
  'node_modules', 'dist', '.git', 'coverage', '.turbo',
]);

// ===================================================
// Scanner
// ===================================================
interface ScanResult {
  file: string;
  violations: Array<{
    line: number;
    column: number;
    char: string;
    description: string;
  }>;
}

function scanFile(filePath: string): ScanResult {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations: ScanResult['violations'] = [];

  lines.forEach((line, lineIndex) => {
    let match: RegExpExecArray | null;
    const lineRegex = new RegExp(ZWC_REGEX.source, 'g');

    while ((match = lineRegex.exec(line)) !== null) {
      const char = match[0];
      violations.push({
        line: lineIndex + 1,
        column: match.index + 1,
        char,
        description: ZERO_WIDTH_CHARS[char] ?? `UNKNOWN (U+${char.codePointAt(0)?.toString(16).toUpperCase()})`,
      });
    }
  });

  return { file: filePath, violations };
}

function walkDirectory(dir: string): string[] {
  const files: string[] = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkDirectory(fullPath));
    } else if (entry.isFile() && SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

// ===================================================
// Auto-Fix (--fix flag)
// ===================================================
function fixFile(filePath: string): boolean {
  const original = fs.readFileSync(filePath, 'utf-8');
  const cleaned = original.replace(ZWC_REGEX, '');

  if (original !== cleaned) {
    fs.writeFileSync(filePath, cleaned, 'utf-8');
    return true;
  }

  return false;
}

// ===================================================
// Main
// ===================================================
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');
  const targetDir = args.find((a) => !a.startsWith('--')) ?? './packages/tec-core-sdk/src';

  console.log('\n🔐 TEC SDK — Zero-Width Character Scanner');
  console.log('==========================================');
  console.log(`📁 Target : ${path.resolve(targetDir)}`);
  console.log(`🔧 Mode   : ${shouldFix ? 'SCAN + AUTO-FIX' : 'SCAN ONLY'}\n`);

  const files = walkDirectory(targetDir);
  console.log(`📄 Files scanned: ${files.length}\n`);

  const infected: ScanResult[] = [];
  const fixed: string[] = [];

  for (const file of files) {
    const result = scanFile(file);

    if (result.violations.length > 0) {
      infected.push(result);

      if (shouldFix) {
        const wasFixed = fixFile(file);
        if (wasFixed) fixed.push(file);
      }
    }
  }

  // ===== Report =====
  if (infected.length === 0) {
    console.log('✅ CLEAN — No zero-width characters found.');
    process.exit(0);
  }

  console.log(`🚨 INFECTED FILES: ${infected.length}\n`);

  for (const result of infected) {
    console.log(`\n📄 ${result.file}`);
    for (const v of result.violations) {
      console.log(
        `   ⚠️  Line ${v.line}, Col ${v.column} — ${v.description}`
      );
    }
  }

  if (shouldFix) {
    console.log(`\n✅ Fixed ${fixed.length} file(s).`);
    console.log('⚠️  Review all changes before committing.\n');
    process.exit(0);
  } else {
    console.log('\n❌ Run with --fix to auto-remove all violations.');
    console.log('   npx ts-node scripts/scan-zwc.ts --fix\n');
    process.exit(1); // ← Fails CI pipeline
  }
}

main().catch((err) => {
  console.error('💥 Scanner crashed:', err);
  process.exit(2);
});
