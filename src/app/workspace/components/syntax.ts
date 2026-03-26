import { LanguageId, TokenKind } from "./editor-types";

export const LANGUAGE_OPTIONS: LanguageId[] = [
  "typescript",
  "javascript",
  "python",
  "css",
  "json",
  "markdown",
];

export const SAMPLE_CODE: Record<LanguageId, string> = {
  typescript: `type Workspace = {
  id: string;
  name: string;
};

export function createWorkspace(name: string): Workspace {
  const id = crypto.randomUUID();
  return { id, name };
}`,
  javascript: `export function sum(items) {
  return items.reduce((total, item) => total + item, 0);
}

console.log(sum([1, 2, 3]));`,
  python: `def calculate_total(items):
    total = 0
    for item in items:
        total += item
    return total

print(calculate_total([1, 2, 3]))`,
  css: `.editor {
  display: grid;
  gap: 0.75rem;
  color: var(--text-primary);
}

.editor:hover {
  border-color: var(--border-accent);
}`,
  json: `{
  "workspace": "new-horizon",
  "theme": "dark",
  "autosave": true,
  "refreshInterval": 30
}`,
  markdown: `# New Horizon\n\nUse \`/workspace\` to edit files with syntax coloring.\n\n- Select language\n- Edit code\n- Tune colors`,
};

const KEYWORDS: Record<LanguageId, string[]> = {
  typescript: [
    "type",
    "interface",
    "enum",
    "export",
    "import",
    "from",
    "function",
    "return",
    "const",
    "let",
    "class",
    "extends",
    "implements",
    "if",
    "else",
    "for",
    "while",
    "new",
    "as",
    "async",
    "await",
  ],
  javascript: [
    "export",
    "import",
    "from",
    "function",
    "return",
    "const",
    "let",
    "var",
    "class",
    "extends",
    "if",
    "else",
    "for",
    "while",
    "new",
    "async",
    "await",
  ],
  python: [
    "def",
    "class",
    "return",
    "if",
    "elif",
    "else",
    "for",
    "while",
    "in",
    "import",
    "from",
    "as",
    "try",
    "except",
    "with",
    "pass",
    "True",
    "False",
    "None",
  ],
  css: ["display", "grid", "color", "background", "border", "padding", "margin"],
  json: ["true", "false", "null"],
  markdown: ["#", "##", "###", "-"],
};

type Token = {
  value: string;
  kind: TokenKind;
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
}

function getCommentPattern(language: LanguageId): string {
  if (language === "python") {
    return "#.*$";
  }

  if (language === "markdown") {
    return "$^";
  }

  if (language === "css") {
    return "\\/\\*.*\\*\\/";
  }

  return "\\/\\/.*$|\\/\\*.*\\*\\/";
}

function getStringPattern(language: LanguageId): string {
  if (language === "json") {
    return '"(?:\\\\.|[^"\\\\])*"';
  }

  return "\"(?:\\\\.|[^\"\\\\])*\"|'(?:\\\\.|[^'\\\\])*'|`(?:\\\\.|[^`\\\\])*`";
}

function buildPattern(language: LanguageId): RegExp {
  const comment = getCommentPattern(language);
  const string = getStringPattern(language);
  const number = "\\b\\d+(?:\\.\\d+)?\\b";
  const functionCall = "\\b[A-Za-z_][\\w$]*(?=\\()";
  const keywords = KEYWORDS[language].map(escapeRegex).join("|");
  const keyword = keywords.length > 0 ? `\\b(?:${keywords})\\b` : "a^";

  return new RegExp(`(${comment})|(${string})|(${number})|(${keyword})|(${functionCall})`, "g");
}

export function getKeywords(language: LanguageId): string[] {
  return KEYWORDS[language];
}

export function tokenizeLine(line: string, language: LanguageId): Token[] {
  if (!line) {
    return [{ value: "", kind: "plain" }];
  }

  const pattern = buildPattern(language);
  const tokens: Token[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(pattern)) {
    if (match.index === undefined) {
      continue;
    }

    if (match.index > lastIndex) {
      tokens.push({
        value: line.slice(lastIndex, match.index),
        kind: "plain",
      });
    }

    const value = match[0];
    let kind: TokenKind = "plain";

    if (match[1]) {
      kind = "comment";
    } else if (match[2]) {
      kind = "string";
    } else if (match[3]) {
      kind = "number";
    } else if (match[4]) {
      kind = "keyword";
    } else if (match[5]) {
      kind = "function";
    }

    tokens.push({ value, kind });
    lastIndex = match.index + value.length;
  }

  if (lastIndex < line.length) {
    tokens.push({ value: line.slice(lastIndex), kind: "plain" });
  }

  return tokens;
}
