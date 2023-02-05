import type { Course } from "../interfaces/course";

export const parser = (json: string): Course | null => {
  const obj = JSON.parse(json);
  if (!isCourse(obj)) {
    return null;
  }
  return obj;
};

export const isCourse = (obj: any): obj is Course => {
  if (!Array.isArray(obj.questions)) return false;
  return true;
};
