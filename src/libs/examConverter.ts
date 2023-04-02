import type { Exam, JaEn } from "../interfaces/exam";
import type { UIExam, UIJaEn } from "../interfaces/uiExam";

const text2String = (text: string | string[] | null | undefined): string => {
  if (Array.isArray(text)) {
    return text.join("\n");
  }
  if (text) {
    return text;
  }
  return "";
};

export const exam2ui = (exam: Exam): UIExam => {
  const uiExam: UIExam = {
    meta: {
      author: {
        icon_url: exam.meta?.author?.icon_url ?? "",
        name: exam.meta?.author?.name ?? "",
      },
      description: exam.meta?.description ?? "",
      url: exam.meta?.url ?? "",
      last_uploaded_at: null,
      title: exam.meta?.title ?? "",
      minutes: exam.meta?.minutes ?? null,
      pass_condition:
        {
          count: exam.meta?.pass_condition?.count ?? null,
          percent: exam.meta?.pass_condition?.percent ?? null,
        } ?? "",
      text_type: exam.meta?.text_type ?? "markdown",
      language: exam.meta?.language ?? "ja",
    },
    questions: exam.questions.map((question) => ({
      statement: {
        ja: text2String(question.statement.ja),
        en: text2String(question.statement.en),
        isTranslating: false,
      },
      choices: question.choices.map((choice) => ({
        ja: text2String(choice.ja),
        en: text2String(choice.en),
        isTranslating: false,
      })),
      explanation: {
        ja: text2String(question.explanation?.ja),
        en: text2String(question.explanation?.en),
        isTranslating: false,
      },
      corrects: question.corrects,
      selects: [],
    })),
  };
  return uiExam;
};

const formatJaEn = (uiJaEn: UIJaEn): JaEn => {
  const en = uiJaEn.en;
  if (en) {
    return {
      en,
      ja: uiJaEn.ja,
    };
  }
  return {
    en,
    ja: uiJaEn.ja ?? "",
  };
};

export const ui2exam = (exam: UIExam): Exam => {
  const uiExam: Exam = {
    ...exam,
    questions: exam.questions.map((question) => {
      return {
        ...question,
        statement: formatJaEn(question.statement),
        choices: question.choices.map((choice) => formatJaEn(choice)),
        explanation: question.explanation
          ? formatJaEn(question.explanation)
          : null,
      };
    }),
  };
  return uiExam;
};
