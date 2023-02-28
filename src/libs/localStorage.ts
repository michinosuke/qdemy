import type { Course } from "../interfaces/course";
import type { CourseInLocalStorage } from "../interfaces/courseInLocalStorage";
import { ulid } from "ulid";

const getCourseId = (): string => `course.${ulid()}`;

const saveCourse = (course: Course): string => {
  const strCourse = JSON.stringify(course, null, 4);
  const json: CourseInLocalStorage = {
    createdAt: new Date().toString(),
    updatedAt: new Date().toString(),
    course: strCourse,
  };
  const courseId = getCourseId();
  localStorage.setItem(`course.${courseId}`, JSON.stringify(json));
  return courseId;
};

export const ls = { saveCourse };
