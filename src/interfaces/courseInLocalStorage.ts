export type CourseInLocalStorage = {
  createdAt: string;
  updatedAt: string;
  course: string;
};

export const isCourseInLocalStorage = (
  obj: any
): obj is CourseInLocalStorage => {
  if (typeof obj.createdAt !== "string") return false;
  if (typeof obj.updatedAt !== "string") return false;
  if (typeof obj.course !== "string") return false;
  return true;
};
