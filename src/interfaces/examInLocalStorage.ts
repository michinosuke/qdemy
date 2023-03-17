export type ExamInLocalStorage = {
  createdAt: string;
  updatedAt: string;
  exam: string;
};

export const isExamInLocalStorage = (obj: any): obj is ExamInLocalStorage => {
  if (typeof obj.createdAt !== "string") return false;
  if (typeof obj.updatedAt !== "string") return false;
  if (typeof obj.exam !== "string") return false;
  return true;
};
