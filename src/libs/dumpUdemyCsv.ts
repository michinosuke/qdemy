import type { Exam, Language } from "../interfaces/exam";

import type { UIExam } from "../interfaces/uiExam";
import { format } from "date-fns";

type Row = {
  Question: string;
  "Question Type (multiple-choice or multi-select)":
    | "multi-select"
    | "multiple-choice";
  "Answer Option 1": string;
  "Answer Option 2": string;
  "Answer Option 3": string;
  "Answer Option 4": string;
  "Answer Option 5": string;
  "Answer Option 6": string;
  "Answer Option 7": string;
  "Answer Option 8": string;
  "Answer Option 9": string;
  "Answer Option 10": string;
  "Answer Option 11": string;
  "Answer Option 12": string;
  "Answer Option 13": string;
  "Answer Option 14": string;
  "Answer Option 15": string;
  "Correct Response": string;
  Explanation: string;
  "Knowledge Area": string;
};

const formatStr = (str: string | null | undefined) => {
  if (typeof str !== "string") return "";
  return '"' + str.replaceAll("\n", "").replaceAll('"', '""') + '"';
};

const statementPrefix = (corrects: number[]): string => {
  if (corrects.length <= 1) return "";
  return ` (${corrects.length}つ選択)`;
};

const exam2udemyCsv = ({
  exam,
  preferLang,
}: {
  exam: UIExam;
  preferLang: Language;
}): string | null => {
  const rows: Row[] = exam.questions.map((question) => ({
    Question:
      formatStr(question.statement[preferLang]) +
      statementPrefix(question.corrects),
    "Question Type (multiple-choice or multi-select)":
      question.corrects.length > 1 ? "multi-select" : "multiple-choice",
    "Answer Option 1": formatStr(question.choices[1 - 1]?.[preferLang]),
    "Answer Option 2": formatStr(question.choices[2 - 1]?.[preferLang]),
    "Answer Option 3": formatStr(question.choices[3 - 1]?.[preferLang]),
    "Answer Option 4": formatStr(question.choices[4 - 1]?.[preferLang]),
    "Answer Option 5": formatStr(question.choices[5 - 1]?.[preferLang]),
    "Answer Option 6": formatStr(question.choices[6 - 1]?.[preferLang]),
    "Answer Option 7": formatStr(question.choices[7 - 1]?.[preferLang]),
    "Answer Option 8": formatStr(question.choices[8 - 1]?.[preferLang]),
    "Answer Option 9": formatStr(question.choices[9 - 1]?.[preferLang]),
    "Answer Option 10": formatStr(question.choices[10 - 1]?.[preferLang]),
    "Answer Option 11": formatStr(question.choices[11 - 1]?.[preferLang]),
    "Answer Option 12": formatStr(question.choices[12 - 1]?.[preferLang]),
    "Answer Option 13": formatStr(question.choices[13 - 1]?.[preferLang]),
    "Answer Option 14": formatStr(question.choices[14 - 1]?.[preferLang]),
    "Answer Option 15": formatStr(question.choices[15 - 1]?.[preferLang]),
    "Correct Response": formatStr(question.corrects.join(",")),
    Explanation: formatStr(question.explanation[preferLang]),
    "Knowledge Area": "",
  }));
  const keys: (keyof Row)[] = [
    "Question",
    "Question Type (multiple-choice or multi-select)",
    "Answer Option 1",
    "Answer Option 2",
    "Answer Option 3",
    "Answer Option 4",
    "Answer Option 5",
    "Answer Option 6",
    "Answer Option 7",
    "Answer Option 8",
    "Answer Option 9",
    "Answer Option 10",
    "Answer Option 11",
    "Answer Option 12",
    "Answer Option 13",
    "Answer Option 14",
    "Answer Option 15",
    "Correct Response",
    "Explanation",
    "Knowledge Area",
  ];
  const strFirstRow: string = keys.join(",");
  const strRows: string[] = rows.map((row) =>
    keys.map((key) => row[key]).join(",")
  );
  const result: string = [strFirstRow, ...strRows].join("\n");
  return result;
};

export const dumpUdemyCsv = ({
  exam,
  preferLang,
}: {
  exam: UIExam;
  preferLang: Language;
}) => {
  const str = exam2udemyCsv({ exam, preferLang });
  if (str === null) {
    alert("設問がありません。");
    return;
  }
  const blob = new Blob([str], { type: "application/json" });

  let dummyA = document.createElement("a");
  document.body.appendChild(dummyA);

  dummyA.href = window.URL.createObjectURL(blob);
  dummyA.download = `exam.blue_udemy_${
    exam.meta?.title && "_" + exam.meta.title.trim().replace(/\s/g, "-")
  }_${format(new Date(), "yyyyMMdd-HHmmss")}.csv`;
  dummyA.click();
  document.body.removeChild(dummyA);
};
