import type { Exam } from "../interfaces/exam";
import type { ExamInLocalStorage } from "../interfaces/examInLocalStorage";
import { customNanoId } from "./customNanoId";
import type { GptUsage } from "./translate";

const deleteExam = (examId: string) => {
  localStorage.removeItem(`exam.${examId}`);
};

const getExam = (
  examId: string
): {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  exam: Exam;
} | null => {
  const row = localStorage.getItem(`exam.${examId}`);
  if (!row) return null;
  try {
    const json: ExamInLocalStorage = JSON.parse(row);
    const exam: Exam = JSON.parse(json.exam);
    return {
      id: examId,
      exam,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
    };
  } catch (e: any) {
    return null;
  }
};

const saveExam = (exam: Exam, examId?: string): string => {
  const strExam = JSON.stringify(exam, null, 4);
  const cachedExam = examId && getExam(examId);
  if (cachedExam) {
    const json: ExamInLocalStorage = {
      createdAt: cachedExam.createdAt.toString(),
      updatedAt: new Date().toString(),
      exam: strExam,
    };
    localStorage.setItem(`exam.${examId}`, JSON.stringify(json));
    return examId;
  }
  const json: ExamInLocalStorage = {
    createdAt: new Date().toString(),
    updatedAt: new Date().toString(),
    exam: strExam,
  };
  const id = examId ?? customNanoId();
  localStorage.setItem(`exam.${id}`, JSON.stringify(json));
  return id;
};

const addTotalTranslateToken = ({
  prompt_tokens,
  completion_tokens,
  total_tokens,
}: GptUsage) => {
  const tokenStr = localStorage.getItem("translate_token");
  if (!tokenStr) {
    const token: GptUsage = {
      completion_tokens,
      prompt_tokens,
      total_tokens,
    };
    localStorage.setItem("translate_token", JSON.stringify(token));
    return;
  }
  const token: GptUsage = JSON.parse(tokenStr);
  token.prompt_tokens += prompt_tokens;
  token.completion_tokens += completion_tokens;
  token.total_tokens += total_tokens;
  localStorage.setItem("translate_token", JSON.stringify(token));
};

const getTotalTranslateToken = (): GptUsage => {
  const tokenStr = localStorage.getItem("translate_token");
  if (!tokenStr)
    return {
      completion_tokens: 0,
      prompt_tokens: 0,
      total_tokens: 0,
    };
  const token: GptUsage = JSON.parse(tokenStr);
  return token;
};

export const ls = {
  saveExam,
  deleteExam,
  addTotalTranslateToken,
  getTotalTranslateToken,
};
