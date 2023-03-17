import type { Exam } from "../interfaces/exam";
import { format } from "date-fns";

export const dumpExam = (exam: Exam) => {
  const str = JSON.stringify(exam, null, 4);
  const blob = new Blob([str], { type: "application/json" });

  let dummyA = document.createElement("a");
  document.body.appendChild(dummyA);

  dummyA.href = window.URL.createObjectURL(blob);
  dummyA.download = `exam.blue_${
    exam.meta?.title && "_" + exam.meta.title.trim().replace(/\s/g, "-")
  }_${format(new Date(), "yyyyMMdd-HHmmss")}.json`;
  dummyA.click();
  document.body.removeChild(dummyA);
};
