export type TextType = "plain" | "html" | "markdown";

export type Problem = {
  statement: UIJaEn;
  choices: UIJaEn[];
  corrects: number[];
  explanation?: UIJaEn;
  selects: number[];
};

export type Language = "ja" | "en";

type AuthorUrl = {
  homepage: string | string[];
  twitter: string | string[];
};

type Author = {
  name?: string;
  icon_url?: string;
  url?: AuthorUrl;
};

export type Meta = {
  url?: string;
  last_uploaded_at?: string;
  title?: string;
  description?: string | string[];
  minutes?: number;
  pass_condition?: {
    count?: number;
    percent?: number;
  };
  text_type?: TextType;
  language?: Language;
  author?: Author;
};

export type Exam = {
  meta?: Meta;
  problems: Problem[];
};

export type JaEn =
  | { ja: string | string[]; en: string | string[] }
  | { ja: string | string[]; en?: null }
  | { ja?: null; en: string | string[] };

export type UIJaEn = JaEn & { isTranslating: boolean };
