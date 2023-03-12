import {} from "fs/promises";

import type { Course } from "../interfaces/course";
import { format } from "date-fns";

export const dumpCourse = (course: Course) => {
  const str = JSON.stringify(course, null, 4);
  const blob = new Blob([str], { type: "application/json" });

  let dummyA = document.createElement("a");
  document.body.appendChild(dummyA);

  dummyA.href = window.URL.createObjectURL(blob);
  dummyA.download = `exam.blue_${
    course.meta?.title && "_" + course.meta.title.trim().replace(/\s/g, "-")
  }_${format(new Date(), "yyyyMMdd-HHmmss")}.json`;
  dummyA.click();
  document.body.removeChild(dummyA);
};
