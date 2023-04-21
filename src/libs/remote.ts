import { CREATE_EXAM_FUNCTION_URL, GET_EXAM_FUNCTION_URL } from "./constants";

import type { Exam } from "../interfaces/exam";
import type { UIExam } from "../interfaces/uiExam";
import axios from "axios";
import { transformer } from "./examConverter";

const save = async (
  uiExam: UIExam,
  examId?: string | undefined | null
): Promise<{ examId: string; examUrl: string }> => {
  const exam = transformer.exam.ui2exam(uiExam);
  if (!exam) throw new Error();
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
