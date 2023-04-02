export type TextType = "plain" | "html" | "markdown";

export type Question = {
  statement: JaEn;
  choices: JaEn[];
  corrects: number[];
  explanation?: JaEn | null;
};

export type Language = "ja" | "en";

export type AuthorUrl = {
  homepage?: string | null;
  twitter?: string | null;
  udemy?: string | null;
};

export type Author = {
  name?: string | null;
  icon_url?: string | null;
  // url?: AuthorUrl | null | string;
};

export type Meta = {
  url?: string | null;
  title?: string | null;
  description?: string | string[] | null;
  minutes?: number | null;
  pass_condition?: {
    count?: number | null;
    percent?: number | null;
  } | null;
  text_type?: TextType | null;
  language?: Language | null;
  author?: Author | null;
};

export type Exam = {
  meta?: Meta | null;
  questions: Question[];
};

export type JaEn =
  | { ja: string | string[]; en: string | string[] }
  | { ja: string | string[]; en?: null }
  | { ja?: null; en: string | string[] };
