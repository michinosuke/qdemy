import type { Course } from "../interfaces/course";
import { parseJSON } from "./parse-json";

export const parser = (
  jsonString: string
): {
  course: Course | null;
  fatalMessage: string[];
  warnMessage: string[];
} | null => {
  const { json, error } = parseJSON(jsonString);
  if (error) {
    return {
      course: null,
      fatalMessage: ["読み込まれたファイルは有効なJSON形式ではありません。"],
      warnMessage: [],
    };
  }
  if (!isCourse(json)) {
    // [TODO]
    return {
      course: null,
      fatalMessage: ["読み込まれたファイルは有効なJSON形式ではありません。"],
      warnMessage: [],
    };
  }
  return { course: json, fatalMessage: [], warnMessage: [] };
};

export const isCourse = (obj: any): obj is Course => {
  if (!Array.isArray(obj.questions)) return false;
  return true;
};

export const isQuestion = () => {};
