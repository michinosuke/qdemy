import { parser } from "./parser";

const invalidFiles: string[] = ["", "{}", "[]", "a", '"a"', "[a"];

it.each(invalidFiles)("Course型じゃなかった場合は、nullが返る", (file) => {
  expect(parser(file)).toBeNull();
});
