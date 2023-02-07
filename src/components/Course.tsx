import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import type { Course, Question } from "../interfaces/course";

const ABC = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

export const CourseComponent = () => {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const source = search.get("source");
    setSourceUrl(source);
  }, []);

  const fetchCourse = async () => {
    if (!sourceUrl) return;
    const json = await axios.get(sourceUrl);
    console.log(json.data);
    setCourse(json.data);
  };

  useEffect(() => {
    fetchCourse();
  }, [sourceUrl]);

  if (!sourceUrl) {
    return <p>パラメータ source を指定してください</p>;
  }
  if (!course) return <></>;
  return (
    <div className="w-full max-w-xl mx-auto py-20">
      <ul className="flex flex-col gap-10">
        {course.questions.map((question, i) => (
          <li
            key={i}
            onClick={() => {
              const courseClone = JSON.parse(JSON.stringify(course)) as Course;
              const q = courseClone.questions[i];
              if (!q) return;
              q.clicked = !q.clicked;
              setCourse(courseClone);
            }}
          >
            <h2 className="text-lg font-bold">Q. {i + 1}</h2>
            <p>{question.question}</p>
            <ul className="flex flex-col gap-3 mt-3">
              {question.choices.map((choice, j) => (
                <li
                  key={j}
                  className={`flex gap-5 py-2 px-3 ${
                    question.corrects.includes(j + 1) && question.clicked
                      ? "bg-blue-100"
                      : ""
                  } ${
                    !question.corrects.includes(j + 1) && question.clicked
                      ? "bg-red-100"
                      : ""
                  }`}
                >
                  <span>{ABC[j]}</span>
                  {choice}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};
