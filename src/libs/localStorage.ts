import type { Course } from "../interfaces/course";
import type { CourseInLocalStorage } from "../interfaces/courseInLocalStorage";
import { ulid } from "ulid";

const saveCourse = (course: Course, courseId?: string): string => {
  const strCourse = JSON.stringify(course, null, 4);
  const json: CourseInLocalStorage = {
    createdAt: new Date().toString(),
    updatedAt: new Date().toString(),
    course: strCourse,
  };
  const id = courseId ?? ulid();
  localStorage.setItem(`course.${id}`, JSON.stringify(json));
  return id;
};

export const ls = { saveCourse };
