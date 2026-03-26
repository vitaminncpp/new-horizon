"use client";

import { useEffect, useState } from "react";
import { EditorHeader } from "./components/editor-header";
import { EditorInspector } from "./components/editor-inspector";
import { EditorPane } from "./components/editor-pane";
import { KeywordColors, LanguageId, TokenColors } from "./components/editor-types";
import { EditorSidebar } from "./components/editor-sidebar";
import { LANGUAGE_OPTIONS, SAMPLE_CODE } from "./components/syntax";

type ThemeMode = "light" | "dark";

const DEFAULT_KEYWORD_COLORS: KeywordColors = {
  typescript: "#5bd1ff",
  javascript: "#ffd866",
  python: "#7fdc9a",
  css: "#7ab8ff",
  json: "#ff9f7a",
  markdown: "#ffcf70",
};

const DEFAULT_TOKEN_COLORS: TokenColors = {
  string: "#d9b3ff",
  comment: "#88a3b8",
  number: "#79e2c0",
  function: "#ffa6a6",
};

export default function Workspace() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const savedTheme = localStorage.getItem("nh.theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const [language, setLanguage] = useState<LanguageId>("typescript");
  const [codeByLanguage, setCodeByLanguage] = useState<Record<LanguageId, string>>(SAMPLE_CODE);
  const [keywordColors, setKeywordColors] = useState<KeywordColors>(DEFAULT_KEYWORD_COLORS);
  const [tokenColors, setTokenColors] = useState<TokenColors>(DEFAULT_TOKEN_COLORS);

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("nh.theme", theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.body.dataset.theme = nextTheme;
    localStorage.setItem("nh.theme", nextTheme);
  }

  function handleCodeChange(nextCode: string) {
    setCodeByLanguage((previous) => ({
      ...previous,
      [language]: nextCode,
    }));
  }

  function handleLanguageChange(nextLanguage: LanguageId) {
    if (!LANGUAGE_OPTIONS.includes(nextLanguage)) {
      return;
    }

    setLanguage(nextLanguage);
  }

  function handleKeywordColorChange(targetLanguage: LanguageId, color: string) {
    setKeywordColors((previous) => ({
      ...previous,
      [targetLanguage]: color,
    }));
  }

  function handleTokenColorChange(token: keyof TokenColors, color: string) {
    setTokenColors((previous) => ({
      ...previous,
      [token]: color,
    }));
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-(--bg) text-(--text-primary)">
      <div className="absolute inset-0 bg-(image:--gradient-page)" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <EditorHeader onThemeToggle={toggleTheme} />

        <section className="grid flex-1 gap-4 lg:grid-cols-[220px_1fr_340px]">
          <EditorSidebar />
          <EditorPane
            language={language}
            code={codeByLanguage[language]}
            keywordColors={keywordColors}
            tokenColors={tokenColors}
            onCodeChange={handleCodeChange}
          />
          <EditorInspector
            language={language}
            code={codeByLanguage[language]}
            keywordColors={keywordColors}
            tokenColors={tokenColors}
            onLanguageChange={handleLanguageChange}
            onKeywordColorChange={handleKeywordColorChange}
            onTokenColorChange={handleTokenColorChange}
          />
        </section>
      </div>
    </main>
  );
}
