import { useEffect, useState } from "react";
import type { Exam } from "../interfaces/exam";
import { ls } from "../libs/localStorage";
import { Heading } from "./Heading";

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
    try {
      const exam: Exam = JSON.parse(result);
      const examId = ls.saveExam(exam);
      location.href = `/exam?cache=${examId}`;
    } catch (e) {
      console.log("パースエラー");
    }
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
    <div className="mt-10 py-3 px-5 border overflow-x-scroll">
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
