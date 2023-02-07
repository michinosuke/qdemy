import { parser } from "./parser";
import Valid01 from "../test-data/valid-01.json";
import type { Course } from "../interfaces/course";

const invalidFiles: string[] = ["", "{}", "[]", "a", '"a"', "[a"];
const validFiles: Course[] = [Valid01];

it.each(invalidFiles)("Course型じゃなかった場合は、nullが返る", (file) => {
  expect(parser(file)).toBeNull();
});

it.each(validFiles)(
  "Course型であれば、パースされたオブジェクトが返る",
  (file) => {
    expect(parser(JSON.stringify(file))).toEqual(file);
  }
);
