import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import type { Course, Question } from "../interfaces/course";
import CourseTestData from "../test-data/pas-01.json";

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
  const [file, setFile] = useState<File | null>(null);
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const source = search.get("source");
    setSourceUrl(source);
    // getFileInLocalStorage();
    // forDebug
    setCourse(CourseTestData as Course);
  }, []);

  const saveMouseEnterQuestion = (questionId: string) => {
    localStorage.setItem("focusedQuestionId", questionId);
  };

  const restoreScroll = () => {
    const questionId = localStorage.getItem("focusedQuestionId");
    if (!questionId) return;
    const question = document.getElementById(questionId);
    if (question) {
      question.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  // const getFileInLocalStorage = () => {
  //   const str = localStorage.getItem("localFile");
  //   if (!str) return;
  //   const file = JSON.parse(str);

  //   const fileReader = new FileReader();
  //   fileReader.addEventListener("load", (e) => {
  //     const result = e.target?.result;
  //     if (typeof result !== "string") return;
  //     console.log(result);
  //     try {
  //       const json = JSON.parse(result);
  //       setCourse(json);
  //     } catch (e) {
  //       console.log("パースエラー");
  //     }
  //   });
  //   fileReader.readAsText(file);
  // };

  const fetchCourse = async () => {
    if (!sourceUrl) return;
    const json = await axios.get(sourceUrl, {
      params: {
        timestamp: Date.now(),
      },
    });
    setCourse(json.data);
  };

  useEffect(() => {
    fetchCourse();
  }, [sourceUrl]);

  useEffect(() => {
    if (!file) return;
    importFromFile(file);
    setInterval(() => {
      watchFileModify(file);
    }, 1000);
  }, [file]);

  useEffect(() => {
    if (!initialized) {
      setTimeout(restoreScroll, 100);
      setTimeout(() => setInitialized(true), 3000);
    }
  }, [course]);

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
        const json = JSON.parse(result);
        setCourse(json);
      } catch (e) {
        console.log("パースエラー");
      }
    });
    fileReader.addEventListener("error", () => {
      location.reload();
    });
    fileReader.readAsText(file);
  };

  const replaceBr = (str: string | string[]) => {
    if (Array.isArray(str)) {
      return str.map((s) => (s === "" ? <br /> : <p>{s}</p>));
    }
    return str;
  };

  if (!course && !sourceUrl) {
    return (
      <input
        type="file"
        className="m-5"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setFile(file);
          // localStorage.setItem("localFile", JSON.stringify(file));
        }}
      />
    );
  }

  if (!course) return <></>;

  return (
    <div className="w-full max-w-3xl mx-auto py-5 px-5">
      <div className="flex flex-col gap-5">
        {course.meta?.title && (
          <h1 className="text-xl font-extrabold">{course.meta.title}</h1>
        )}
        {course.meta?.description && <p>{course.meta?.description}</p>}
        <div className="flex gap-3 items-center">
          {course.meta?.author?.icon_url && (
            <div
              className="rounded-full bg-cover bg-center w-20 h-20"
              style={{ backgroundImage: `url(${course.meta.author.icon_url})` }}
            />
          )}
          {course.meta?.author?.name && (
            <span className="">{course.meta.author.name}</span>
          )}
        </div>
      </div>
      <ul className="flex flex-col gap-10 mt-10 pt-10 border-t-4">
        {course.questions.map((question, i) => (
          <li
            key={i}
            id={`question-${i + 1}`}
            onMouseEnter={() =>
              initialized && saveMouseEnterQuestion(`question-${i + 1}`)
            }
          >
            <h2 className="text-lg font-bold">Q. {i + 1}</h2>
            <p>
              {question.question.ja
                ? replaceBr(question.question.ja)
                : replaceBr(question.question.en as string)}
            </p>
            <ul className="flex flex-col gap-2 mt-3">
              {question.choices.map((choice, j) => (
                <li
                  key={j}
                  className={`flex gap-5 py-2 px-3 border border-black cursor-pointer ${
                    question.corrects.includes(j + 1) && question.clicked
                      ? "bg-blue-100"
                      : ""
                  } ${
                    !question.corrects.includes(j + 1) && question.clicked
                      ? "bg-red-100"
                      : ""
                  }`}
                  onClick={() => {
                    const courseClone = JSON.parse(
                      JSON.stringify(course)
                    ) as Course;
                    const q = courseClone.questions[i];
                    if (!q) return;
                    q.clicked = !q.clicked;
                    setCourse(courseClone);
                  }}
                >
                  <span>{ABC[j]}</span>
                  {choice.ja ?? choice.en}
                </li>
              ))}
            </ul>
            {question.clicked && question.explanation?.ja && (
              <p className="mt-5 border-l-4 pl-5">
                {replaceBr(question.explanation.ja)}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
