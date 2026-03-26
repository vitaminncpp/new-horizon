export type LanguageId = "typescript" | "javascript" | "python" | "css" | "json" | "markdown";

export type TokenKind = "keyword" | "string" | "comment" | "number" | "function" | "plain";

export type TokenColors = {
  string: string;
  comment: string;
  number: string;
  function: string;
};

export type KeywordColors = Record<LanguageId, string>;
