import type { Exam } from "../interfaces/exam";
import { parseJSON } from "./parse-json";

export const parser = (
  jsonString: string
): {
  exam: Exam | null;
  fatalMessage: string[];
  warnMessage: string[];
} | null => {
  const { json, error } = parseJSON(jsonString);
  if (error) {
    return {
      exam: null,
      fatalMessage: ["読み込まれたファイルは有効なJSON形式ではありません。"],
      warnMessage: [],
    };
  }
  if (!isExam(json)) {
    // [TODO]
    return {
      exam: null,
      fatalMessage: ["読み込まれたファイルは有効なJSON形式ではありません。"],
      warnMessage: [],
    };
  }
  return { exam: json, fatalMessage: [], warnMessage: [] };
};

export const isExam = (obj: any): obj is Exam => {
  if (!Array.isArray(obj.questions)) return false;
  return true;
};

export const isQuestion = () => {};
