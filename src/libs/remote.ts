import axios from "axios";
import type { Course } from "../interfaces/course";

const CREATE_EXAM_FUNCTION_URL =
  "https://kgjfxsubnztqvyuxw7g7ihddoe0ywzcn.lambda-url.ap-northeast-1.on.aws/";
const GET_EXAM_FUNCTION_URL =
  "https://tg3n6cnlkfjtrkj6rg4z7vybja0hgqga.lambda-url.ap-northeast-1.on.aws/";

const save = async (
  course: Course,
  courseId?: string | undefined | null
): Promise<{ courseId: string; courseUrl: string }> => {
  const body: { course: any; courseId?: string } = {
    course,
  };
  if (courseId) body.courseId = courseId;
  const { data } = await axios.post(CREATE_EXAM_FUNCTION_URL, body);
  return {
    courseId: data.courseId,
    courseUrl: `https://exam.blue/course?source=${GET_EXAM_FUNCTION_URL}?courseId=${data.courseId}`,
  };
};

export const remote = { save };
