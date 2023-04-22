export type TextType = "plain" | "html" | "markdown";

export type Question = {
  statement: JaEn;
  choices: JaEn[];
  corrects: number[];
  explanation?: JaEn | null;
  discussions?: Discussion[] | null;
  votes?: Vote[];
};

export type DiscussionAuthor = {
  name: string;
};

export type Discussion = {
  created_at?: string | null;
  author?: DiscussionAuthor | null;
  comment: string;
  guessed_choices?: string[] | null;
  replies?: Discussion[] | null;
  upvote_count?: number | null;
};

export type Vote = {
  label: string;
  percent: number;
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

export type PassCondition = {
  count?: number | null;
  percent?: number | null;
};

export type Meta = {
  url?: string | null;
  title?: string | null;
  description?: string | string[] | null;
  minutes?: number | null;
  pass_condition?: PassCondition | null;
  text_type?: TextType | null;
  language?: Language | null;
  author?: Author | null;
};

export type Exam = {
  meta?: Meta | null;
  questions: Question[];
};

export type JaEn = {
  ja?: string | string[] | null;
  en?: string | string[] | null;
};
