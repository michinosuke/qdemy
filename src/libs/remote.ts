import { CREATE_EXAM_FUNCTION_URL, GET_EXAM_FUNCTION_URL } from "./constants";

import type { Exam } from "../interfaces/exam";
import axios from "axios";

const save = async (
  exam: Exam,
  examId?: string | undefined | null
): Promise<{ examId: string; examUrl: string }> => {
  const body: { exam: Exam; examId?: string } = {
    exam,
  };
  if (examId) body.examId = examId;
  const { data } = await axios.post(CREATE_EXAM_FUNCTION_URL, body, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return {
    examId: data.examId,
    examUrl: `https://exam.blue/exam?source=${GET_EXAM_FUNCTION_URL}?examId=${data.examId}`,
  };
};

export const remote = { save };
