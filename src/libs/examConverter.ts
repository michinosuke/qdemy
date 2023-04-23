import type {
  Author,
  Discussion,
  Exam,
  JaEn,
  Meta,
  PassCondition,
  Question,
  Vote,
} from "../interfaces/exam";
import type {
  UIAuthor,
  UIDiscussion,
  UIExam,
  UIJaEn,
  UIMeta,
  UIPassCondition,
  UIVote,
} from "../interfaces/uiExam";

interface Transformer<I, U> {
  exam2ui: (i: I) => U;
  ui2exam: (u: U) => I | null;
}

const appendIf = <T extends { [KK in K]?: T[K] }, K extends string>(
  target: T,
  origin: T,
  key: K,
  condition: (value: T[K]) => boolean
) => {
  const value = origin[key];
  if (condition(value)) {
    target[key] = value;
  }
};

const isEmpty = (obj: object): boolean => {
  return JSON.stringify(obj) === "{}";
};

const text2String = (text: string | string[] | null | undefined): string => {
  if (Array.isArray(text)) {
    return text.join("\n");
  }
  if (text) {
    return text;
  }
  return "";
};

const passCondition: Transformer<PassCondition, UIPassCondition> = {
  exam2ui: (passCondition: PassCondition): UIPassCondition => ({
    count: passCondition.count ?? 0,
    percent: passCondition.percent ?? 0,
  }),
  ui2exam: (uiPassCondition: UIPassCondition): PassCondition | null => {
    const passCondition: PassCondition = {};
    appendIf(passCondition, uiPassCondition, "count", (x) => x !== 0);
    appendIf(passCondition, uiPassCondition, "percent", (x) => x !== 0);
    if (isEmpty(passCondition)) return null;
    return passCondition;
  },
};

const author: Transformer<Author, UIAuthor> = {
  exam2ui: (author: Author): UIAuthor => ({
    icon_url: author.icon_url ?? "",
    name: author.name ?? "",
  }),
  ui2exam: (uiAuthor: UIAuthor): Author | null => {
    const author: Author = {};
    appendIf(author, uiAuthor, "icon_url", (x) => x !== "");
    appendIf(author, uiAuthor, "name", (x) => x !== "");
    if (isEmpty(author)) return null;
    return author;
  },
};

const meta: Transformer<Meta, UIMeta> = {
  exam2ui: (meta: Meta): UIMeta => ({
    last_uploaded_at: null,
    url: null,
    title: meta.title ?? "",
    description: text2String(meta.description),
    minutes: meta.minutes ?? 0,
    pass_condition: passCondition.exam2ui(meta.pass_condition ?? {}),
    text_type: meta.text_type ?? "markdown",
    language: meta.language ?? "ja",
    author: author.exam2ui(meta.author ?? {}),
  }),
  ui2exam: (uiMeta: UIMeta): Meta => {
    const meta: Meta = {};
    appendIf(meta, uiMeta, "title", (x) => x !== "");
    appendIf(meta, uiMeta, "description", (x) => x !== "");
    appendIf(meta, uiMeta, "minutes", (x) => x !== 0);
    meta.pass_condition = passCondition.ui2exam(uiMeta.pass_condition);
    meta.text_type = uiMeta.text_type;
    meta.language = uiMeta.language;
    meta.author = author.ui2exam(uiMeta.author);
    return meta;
  },
};

const discussion: Transformer<Discussion, UIDiscussion> = {
  exam2ui: (d) => ({
    comment: d.comment,
    author: d.author ? { name: d.author.name } : null,
    created_at: d.created_at ?? null,
    guessed_choices: d.guessed_choices ?? [],
    replies: d.replies?.map((reply) => discussion.exam2ui(reply)) ?? [],
    upvote_count: d.upvote_count ?? 0,
  }),
  ui2exam: (ud) => {
    const d: Discussion = {
      comment: ud.comment,
    };
    appendIf(d, ud, "author", (x) => !!x);
    appendIf(d, ud, "created_at", (x) => !!x);
    appendIf(d, ud, "guessed_choices", (x) => !!x && x.length > 0);
    appendIf(d, ud, "replies", (x) => !!x && x.length > 0);
    appendIf(d, ud, "upvote_count", (x) => !!x && x > 0);
    return d;
  },
};

const exam: Transformer<Exam, UIExam> = {
  exam2ui: (exam) => {
    const uiExam: UIExam = {
      meta: meta.exam2ui(exam.meta ?? {}),
      questions: exam.questions.map((question) => ({
        statement: jaEn.exam2ui(question.statement),
        choices: question.choices.map((choice) => jaEn.exam2ui(choice)),
        explanation: jaEn.exam2ui(question.explanation ?? {}),
        corrects: question.corrects,
        selects: [],
        votes: question.votes ?? [],
        discussions:
          question.discussions?.flatMap((ud) => {
            const d = discussion.exam2ui(ud);
            return d ? [d] : [];
          }) ?? [],
        isExpandedDiscussion: false,
        heading: question.heading ?? "",
      })),
    };
    return uiExam;
  },
  ui2exam: (exam) => {
    const uiExam: Exam = {
      meta: meta.ui2exam(exam.meta),
      questions: exam.questions.map((question) => {
        const statement = jaEn.ui2exam(question.statement);
        if (!statement) {
          throw new Error("statement can not empty.");
        }
        const choices = question.choices.flatMap((choice) => {
          const c = jaEn.ui2exam(choice);
          return c ? [c] : [];
        });
        if (choices.length === 0) {
          throw new Error("choices need to have least 1 choice");
        }
        const q: Question = {
          statement,
          choices,
          corrects: question.corrects,
        };
        const explanation = jaEn.ui2exam(question.explanation);
        if (explanation) q.explanation = explanation;
        const discussions = question.discussions.flatMap((ud) => {
          const d = discussion.ui2exam(ud);
          return d ? [d] : [];
        });
        if (discussions.length > 0) q.discussions = discussions;
        appendIf(q, question, "votes", (x) => !!x && x.length > 0);
        appendIf(q, question, "heading", (x) => x !== "");
        return q;
      }),
    };
    return uiExam;
  },
};

const jaEn: Transformer<JaEn, UIJaEn> = {
  exam2ui: (jaEn) => ({
    ja: text2String(jaEn.ja),
    en: text2String(jaEn.en),
    isTranslating: false,
  }),
  ui2exam: (uiJaEn) => {
    const jaEn = {};
    appendIf(jaEn, uiJaEn, "ja", (x) => x !== "");
    appendIf(jaEn, uiJaEn, "en", (x) => x !== "");
    if (isEmpty(jaEn)) return null;
    return jaEn;
  },
};

export const transformer = {
  passCondition,
  author,
  meta,
  discussion,
  exam,
  jaEn,
};
