import { useEffect, useState } from "react";

import type { Exam } from "../interfaces/exam";
import { Heading } from "./Heading";
import { ls } from "../libs/localStorage";

const watchFileModify = (file: File) => {
  const fileReader = new FileReader();
  fileReader.addEventListener("error", () => {
    location.reload();
  });
  fileReader.readAsText(file);
};

const importFromFile = (file: File) => {
  const fileReader = new FileReader();
  fileReader.addEventListener("load", (e) => {
    const result = e.target?.result;
    if (typeof result !== "string") return;
    const exam: Exam | null = (() => {
      try {
        return JSON.parse(result);
      } catch (e) {
        return null;
      }
    })();
    if (!exam) throw new Error("パースエラー");
    const examId = ls.saveExam(exam);
    location.href = `/exam?cache=${examId}`;
  });
  fileReader.addEventListener("error", () => {
    location.reload();
  });
  fileReader.readAsText(file);
};

export const FileInput = () => {
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!file) return;
    importFromFile(file);
    setInterval(() => {
      watchFileModify(file);
    }, 1000);
  }, [file]);

  return (
    <div className="py-3 px-5 border overflow-x-scroll">
      <Heading>JSONをローカルファイルから取得</Heading>
      <input
        type="file"
        className="m-5"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setFile(file);
        }}
      />
    </div>
  );
};
