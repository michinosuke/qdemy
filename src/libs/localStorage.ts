import type { Course } from "../interfaces/course";
import type { CourseInLocalStorage } from "../interfaces/courseInLocalStorage";
import { ulid } from "ulid";

const deleteCourse = (courseId: string) => {
  localStorage.removeItem(`course.${courseId}`);
};

const getCourse = (
  courseId: string
): {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  course: Course;
} | null => {
  const row = localStorage.getItem(`course.${courseId}`);
  if (!row) return null;
  try {
    const json: CourseInLocalStorage = JSON.parse(row);
    const course: Course = JSON.parse(json.course);
    return {
      id: courseId,
      course,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
    };
  } catch (e: any) {
    return null;
  }
};

const saveCourse = (course: Course, courseId?: string): string => {
  const strCourse = JSON.stringify(course, null, 4);
  const cachedCourse = courseId && getCourse(courseId);
  if (cachedCourse) {
    const json: CourseInLocalStorage = {
      createdAt: cachedCourse.createdAt.toString(),
      updatedAt: new Date().toString(),
      course: strCourse,
    };
    localStorage.setItem(`course.${courseId}`, JSON.stringify(json));
    return courseId;
  }
  const json: CourseInLocalStorage = {
    createdAt: new Date().toString(),
    updatedAt: new Date().toString(),
    course: strCourse,
  };
  const id = courseId ?? ulid();
  localStorage.setItem(`course.${id}`, JSON.stringify(json));
  return id;
};

export const ls = { saveCourse, deleteCourse };
