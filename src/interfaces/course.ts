// export type Question = {
//   question: string | string[];
//   summary?: string;
//   // choices: string[] | string[][];
//   choices: string[];
//   corrects: number[];
//   explanation?: string | string[];
//   clicked: boolean;
// };

// export type Course = {
//   meta?: {
//     title?: string;
//     description?: string | string[];
//     minutes?: number;
//     pass_count?: number;
//     pass_percent?: number;
//     text_type?: "plain" | "html" | "markdown";
//     language?: "ja" | "en";
//     author?: {
//       name?: string;
//       url?: {
//         homepage: string | string[];
//         twitter: string | string[];
//       };
//     };
//   };
//   questions: Question[];
// };

export type TextType = "plain" | "html" | "markdown";

export type Question = {
  question: JaEn;
  choices: JaEn[];
  corrects: number[];
  explanation?: JaEn;
};

export type Language = "ja" | "en";

export type Meta = {
  title?: string;
  description?: string | string[];
  minutes?: number;
  pass_count?: number;
  pass_percent?: number;
  text_type?: TextType;
  language?: Language;
  author?: {
    name?: string;
    icon_url?: string;
    url?: {
      homepage: string | string[];
      twitter: string | string[];
    };
  };
};

export type Course = {
  meta?: Meta;
  questions: Question[];
};

export type JaEn =
  | { ja: string | string[]; en: string | string[] }
  | { ja: string | string[]; en?: null }
  | { ja?: null; en: string | string[] };
