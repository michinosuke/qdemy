// import type { Exam } from "../interfaces/exam";
// import { parser } from "./parser";

// const invalidFiles: string[] = ["", "{}", "[]", "a", '"a"', "[a"];
// const validFiles: Exam[] = [];

// it.each(invalidFiles)("Exam型じゃなかった場合は、nullが返る", (file) => {
//   expect(parser(file)).toBeNull();
// });

// it.each(validFiles)(
//   "Exam型であれば、パースされたオブジェクトが返る",
//   (file) => {
//     expect(parser(JSON.stringify(file))).toEqual(file);
//   }
// );
