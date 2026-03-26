import { KeywordColors, LanguageId, TokenColors } from "./editor-types";
import { getKeywords, LANGUAGE_OPTIONS } from "./syntax";

type EditorInspectorProps = {
  language: LanguageId;
  code: string;
  keywordColors: KeywordColors;
  tokenColors: TokenColors;
  onLanguageChange: (language: LanguageId) => void;
  onKeywordColorChange: (language: LanguageId, color: string) => void;
  onTokenColorChange: (token: keyof TokenColors, color: string) => void;
};

const diagnostics = [
  { label: "Type check", value: "Live", tone: "success" },
  { label: "Highlight", value: "Enabled", tone: "info" },
  { label: "Color editor", value: "Editable", tone: "warning" },
];

const toneClass: Record<string, string> = {
  success: "bg-(--success)",
  warning: "bg-(--warning)",
  info: "bg-(--info)",
};

export function EditorInspector({
  language,
  code,
  keywordColors,
  tokenColors,
  onLanguageChange,
  onKeywordColorChange,
  onTokenColorChange,
}: EditorInspectorProps) {
  const keywords = getKeywords(language).slice(0, 10);
  const lineCount = code.split("\n").length;

  return (
    <aside className="space-y-4 rounded-3xl border border-(--border) bg-(--surface-raised) p-4 shadow-(--shadow-sm)">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-(--text-secondary)">
          Inspector
        </h2>
        <p className="mt-1 text-sm text-(--text-tertiary)">
          Language settings, diagnostics, and syntax color controls.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-[0.12em] text-(--text-secondary)">
          Language
        </span>
        <select
          value={language}
          onChange={(event) => onLanguageChange(event.target.value as LanguageId)}
          className="w-full rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-sm text-(--text-primary) outline-none focus:border-(--border-accent) focus:ring-2 focus:ring-(--ring)"
        >
          {LANGUAGE_OPTIONS.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-2">
        {diagnostics.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-xl border border-(--border) bg-(--surface) px-3 py-2"
          >
            <span className="text-sm text-(--text-secondary)">{item.label}</span>
            <span className="inline-flex items-center gap-2 text-sm text-(--text-primary)">
              <span className={`h-2 w-2 rounded-full ${toneClass[item.tone]}`} />
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-(--border) bg-(--surface) p-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-(--text-secondary)">
          Color Controls
        </p>

        <div className="space-y-2">
          <label className="flex items-center justify-between gap-3 text-xs text-(--text-secondary)">
            <span>Keyword ({language})</span>
            <input
              type="color"
              value={keywordColors[language]}
              onChange={(event) => onKeywordColorChange(language, event.target.value)}
              className="h-8 w-10 rounded border border-(--border) bg-(--surface)"
            />
          </label>
          <label className="flex items-center justify-between gap-3 text-xs text-(--text-secondary)">
            <span>String</span>
            <input
              type="color"
              value={tokenColors.string}
              onChange={(event) => onTokenColorChange("string", event.target.value)}
              className="h-8 w-10 rounded border border-(--border) bg-(--surface)"
            />
          </label>
          <label className="flex items-center justify-between gap-3 text-xs text-(--text-secondary)">
            <span>Comment</span>
            <input
              type="color"
              value={tokenColors.comment}
              onChange={(event) => onTokenColorChange("comment", event.target.value)}
              className="h-8 w-10 rounded border border-(--border) bg-(--surface)"
            />
          </label>
          <label className="flex items-center justify-between gap-3 text-xs text-(--text-secondary)">
            <span>Number</span>
            <input
              type="color"
              value={tokenColors.number}
              onChange={(event) => onTokenColorChange("number", event.target.value)}
              className="h-8 w-10 rounded border border-(--border) bg-(--surface)"
            />
          </label>
          <label className="flex items-center justify-between gap-3 text-xs text-(--text-secondary)">
            <span>Function</span>
            <input
              type="color"
              value={tokenColors.function}
              onChange={(event) => onTokenColorChange("function", event.target.value)}
              className="h-8 w-10 rounded border border-(--border) bg-(--surface)"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-(--border) bg-(--surface-inset) p-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-(--text-secondary)">
          Current Language Keywords
        </p>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {keywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-full border border-(--border) px-2 py-1 text-xs"
              style={{ color: keywordColors[language] }}
            >
              {keyword}
            </span>
          ))}
        </div>
        <p className="text-xs text-(--text-tertiary)">
          {lineCount} lines, {code.length} chars
        </p>
      </div>
    </aside>
  );
}
