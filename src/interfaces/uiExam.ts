export type UITextType = "plain" | "html" | "markdown";

export type UIQuestion = {
  statement: UIJaEn;
  choices: UIJaEn[];
  corrects: number[];
  explanation: UIJaEn;
  selects: number[];
  votes: UIVote[];
  discussions: UIDiscussion[];
  isExpandedDiscussion: boolean;
  heading: string;
};

export type UIDiscussionAuthor = {
  name: string;
};

export type UIDiscussion = {
  created_at: string | null;
  author: UIDiscussionAuthor | null;
  comment: string;
  guessed_choices: string[];
  replies: UIDiscussion[];
  upvote_count: number;
};

export type UIVote = {
  label: string;
  count: number;
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

export type UIPassCondition = {
  count: number;
  percent: number;
};

export type UIMeta = {
  last_uploaded_at: string | null;
  url: string | null;
  title: string;
  description: string;
  minutes: number;
  pass_condition: UIPassCondition;
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
