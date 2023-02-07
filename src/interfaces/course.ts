export type Question = {
  question: string | string[];
  // choices: string[] | string[][];
  choices: string[];
  corrects: number[];
  explanation?: string | string[];
  clicked: boolean;
};

export type Course = {
  meta?: {
    title?: string;
    description?: string | string[];
    minutes?: number;
    pass_count?: number;
    pass_percent?: number;
    text_type?: "plain" | "html" | "markdown";
    language?: "ja" | "en";
    author?: {
      name?: string;
      url?: {
        homepage: string | string[];
        twitter: string | string[];
      };
    };
  };
  questions: Question[];
};
