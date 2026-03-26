"use client";

import { ChangeEvent, useMemo, useRef } from "react";
import { KeywordColors, LanguageId, TokenColors } from "./editor-types";
import { tokenizeLine } from "./syntax";

type EditorPaneProps = {
  language: LanguageId;
  code: string;
  keywordColors: KeywordColors;
  tokenColors: TokenColors;
  onCodeChange: (nextCode: string) => void;
};

function tokenStyle(
  kind: "keyword" | "string" | "comment" | "number" | "function" | "plain",
  language: LanguageId,
  keywordColors: KeywordColors,
  tokenColors: TokenColors,
): { color?: string } {
  if (kind === "keyword") {
    return { color: keywordColors[language] };
  }

  if (kind === "string") {
    return { color: tokenColors.string };
  }

  if (kind === "comment") {
    return { color: tokenColors.comment };
  }

  if (kind === "number") {
    return { color: tokenColors.number };
  }

  if (kind === "function") {
    return { color: tokenColors.function };
  }

  return {};
}

export function EditorPane({
  language,
  code,
  keywordColors,
  tokenColors,
  onCodeChange,
}: EditorPaneProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const lines = useMemo(() => code.split("\n"), [code]);

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onCodeChange(event.target.value);
  }

  function syncScroll() {
    if (!textareaRef.current || !previewRef.current) {
      return;
    }

    previewRef.current.scrollTop = textareaRef.current.scrollTop;
    previewRef.current.scrollLeft = textareaRef.current.scrollLeft;
  }

  return (
    <section className="rounded-3xl border border-(--border) bg-(--surface-raised) p-4 shadow-(--shadow-md)">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-(--text-secondary)">
          Editor
        </h2>
        <span className="rounded-full border border-(--border) bg-(--surface) px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-(--text-secondary)">
          {language}
        </span>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-(--text-secondary)">
            Editable Source
          </p>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleChange}
            onScroll={syncScroll}
            spellCheck={false}
            className="h-[460px] w-full resize-none rounded-xl border border-(--border) bg-(--surface-inset) p-3 font-mono text-sm leading-6 text-(--text-primary) outline-none focus:border-(--border-accent) focus:ring-2 focus:ring-(--ring)"
          />
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--surface) p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-(--text-secondary)">
            Syntax Preview
          </p>
          <div
            ref={previewRef}
            className="h-[460px] overflow-auto rounded-xl border border-(--border) bg-(--surface-inset)"
          >
            <div className="grid min-w-[460px] grid-cols-[auto_1fr]">
              <div className="border-r border-(--border) bg-(--surface) px-3 py-3 text-right text-xs text-(--text-tertiary)">
                {lines.map((_, idx) => (
                  <div key={idx} className="leading-6">
                    {idx + 1}
                  </div>
                ))}
              </div>
              <pre className="px-4 py-3 font-mono text-sm leading-6 text-(--text-primary)">
                {lines.map((line, lineIndex) => (
                  <div key={lineIndex}>
                    {tokenizeLine(line, language).map((token, tokenIndex) => (
                      <span
                        key={`${lineIndex}-${tokenIndex}-${token.value}`}
                        style={tokenStyle(token.kind, language, keywordColors, tokenColors)}
                      >
                        {token.value || " "}
                      </span>
                    ))}
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
