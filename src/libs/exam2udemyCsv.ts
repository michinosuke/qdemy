import type { UIExam } from "../interfaces/uiExam";

type Row = {
  Question: string;
  "Question Type (multiple-choice or multi-select)":
    | "multi-select"
    | "multiple-choice";
  "Answer Option 1": string;
  "Answer Option 2": string;
  "Answer Option 3": string;
  "Answer Option 4": string;
  "Answer Option 5": string;
  "Answer Option 6": string;
  "Answer Option 7": string;
  "Answer Option 8": string;
  "Answer Option 9": string;
  "Answer Option 10": string;
  "Answer Option 11": string;
  "Answer Option 12": string;
  "Answer Option 13": string;
  "Answer Option 14": string;
  "Answer Option 15": string;
  "Correct Response": number[];
  Explanation: string;
  "Knowledge Area": string;
};

const exam2udemyCsv = (exam: UIExam): string => {
  const firstRow = [];
};
