export type UITextType = "plain" | "html" | "markdown";

export type UIQuestion = {
  statement: UIJaEn;
  choices: UIJaEn[];
  corrects: number[];
  explanation: UIJaEn;
  selects: number[];
};

export type UILanguage = "ja" | "en";

export type UIAuthorUrl = {
  homepage: string;
  twitter: string;
  udemy: string;
};

export type UIAuthor = {
  name: string;
  icon_url: string;
  // url: string | UIAuthorUrl;
};

export type UIMeta = {
  last_uploaded_at: string | null;
  url: string;
  title: string;
  description: string | string[];
  minutes: number | null;
  pass_condition: {
    count: number | null;
    percent: number | null;
  };
  text_type: UITextType;
  language: UILanguage;
  author: UIAuthor;
};

export type UIExam = {
  meta: UIMeta;
  questions: UIQuestion[];
};

export type UIJaEn = {
  ja: string;
  en: string;
  isTranslating: boolean;
};
