import type { Course, Language } from "../interfaces/course";
import { isCourseInLocalStorage } from "../interfaces/courseInLocalStorage";
import { useEffect, useState } from "react";

import { Choice } from "./Choice";
import { CourseEdit } from "./CourseEditor";
import axios from "axios";
import { ls } from "../libs/localStorage";
import { sentences2Elements } from "../libs/sentences2Elements";
import { useClickedQuestion } from "../hooks/useClickedQuestion";

export const CourseComponent = () => {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [preferLang, setPreferLang] = useState<Language>("ja");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isCacheMode, setIsCacheMode] = useState<boolean>(false);
  const clickedQuestion = useClickedQuestion();
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const courseId = search.get("cache");
    if (courseId) {
      setCourseId(courseId);
      try {
        const courseKey = `course.${courseId}`;
        const cache = localStorage.getItem(courseKey);
        if (!cache) {
          console.log(`cache key course.${courseId} not found.`);
          return;
        }
        const courseInLocalStorage = JSON.parse(cache);
        if (isCourseInLocalStorage(courseInLocalStorage)) {
          const course = JSON.parse(courseInLocalStorage.course);
          setCourse(course);
          setIsCacheMode(true);
          setIsEditMode(true);
        } else {
          console.log("course in local storage is invalid.");
        }
      } catch (e) {}
    } else {
      const source = search.get("source");
      if (!source) return;
      setSourceUrl(source);
    }
    // getFileInLocalStorage();
  }, []);

  const saveMouseEnterQuestion = (questionId: string) => {
    localStorage.setItem("focusedQuestionId", questionId);
  };

  const restoreScroll = () => {
    const q = new URLSearchParams(window.location.search).get("q");
    const questionId = q
      ? `question-${q}`
      : localStorage.getItem("focusedQuestionId");
    if (!questionId) return;
    const question = document.getElementById(questionId);
    if (question) {
      question.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  const updateCourse = (coursePipe: (course: Course) => Course | null) => {
    const courseClone = JSON.parse(JSON.stringify(course));
    const updatedCourse = coursePipe(courseClone);
    if (!updateCourse) return;
    setCourse(updatedCourse);
  };

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
    if (course && courseId) ls.saveCourse(course, courseId);
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

  console.log({ course });

  if (!course && !sourceUrl) {
    return (
      <div className="px-5 py-5">
        <form action="" className="py-3 px-5 border">
          <h2 className="font-bold">JSONをURLから取得</h2>
          <div className="flex gap-5 mt-5">
            <input
              name="source"
              placeholder="https://example.com/nazonazo.json"
              className="px-2 py-1 w-full border rounded"
            />
            <input
              type="submit"
              className="px-2 py-1 bg-black text-white"
              value="取得"
            />
          </div>
        </form>
        <div className="mt-10 py-3 px-5 border">
          <h2 className="font-bold">JSONをローカルファイルから取得</h2>
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
        </div>
      </div>
    );
  }

  if (!course) return <></>;

  if (isEditMode) {
    return (
      <CourseEdit
        {...{
          course,
          initialized,
          preferLang,
          saveMouseEnterQuestion,
          updateCourse,
          setIsEditMode,
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-5 px-5">
      <div className="w-full bg-gray-800">
        <h1 className="text-white font-bold text-lg py-3 text-center">
          <a href="">Qdemy</a>
        </h1>
      </div>
      <div className="flex flex-col gap-5 mt-10">
        {course.meta?.title && (
          <h1 className="text-xl font-extrabold">{course.meta.title}</h1>
        )}
        {course.meta?.description &&
          sentences2Elements({
            sentences: course.meta.description,
            textType: course.meta.text_type,
            language: preferLang,
          })}
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
      <ul className="flex flex-col gap-24 mt-10 pt-10 border-t-4">
        {course.questions.map((question, questionIndex) => (
          <li
            key={questionIndex}
            id={`question-${questionIndex + 1}`}
            onMouseEnter={() =>
              initialized &&
              saveMouseEnterQuestion(`question-${questionIndex + 1}`)
            }
          >
            <h2 className="text-lg font-bold">
              <a
                href={
                  "./?" +
                  new URLSearchParams([
                    ...new URLSearchParams(window.location.search).entries(),
                    ["q", (questionIndex + 1).toString()],
                  ])
                }
              >
                Q. {questionIndex + 1}
              </a>
            </h2>
            {sentences2Elements({
              sentences: question.question,
              textType: course.meta?.text_type,
              language: preferLang,
            })}
            <ul className="flex flex-col gap-4 mt-3">
              {question.choices.map((choice, choiceIndex) => (
                <Choice
                  choice={choice}
                  color={(() => {
                    if (!clickedQuestion.isClicked(questionIndex))
                      return "default";
                    if (question.corrects.includes(choiceIndex + 1))
                      return "correct";
                    return "incorrect";
                  })()}
                  key={choiceIndex}
                  index={choiceIndex}
                  preferLang={preferLang}
                  textType={course.meta?.text_type}
                  onClick={() => clickedQuestion.toggle(questionIndex)}
                />
              ))}
            </ul>
            {clickedQuestion.isClicked(questionIndex) &&
              question.explanation &&
              sentences2Elements({
                sentences: question.explanation,
                textType: course.meta?.text_type,
                language: preferLang,
                className: "mt-5 border-l-4 pl-5",
              })}
          </li>
        ))}
      </ul>
      <ul className="fixed bottom-10 left-10 flex gap-3">
        <li>
          <button
            onClick={() => setPreferLang(preferLang === "ja" ? "en" : "ja")}
            className="bg-white px-3 py-2 rounded-md shadow-lg"
          >
            {preferLang === "ja" ? "日本語" : "英語"}
          </button>
        </li>
        <li>
          <button
            className="bg-white px-3 py-2 rounded-md shadow-lg"
            onClick={() => {
              if (isCacheMode) {
                setIsEditMode(!isEditMode);
                return;
              }
              window.location.href = `?cache=${ls.saveCourse(course)}`;
            }}
          >
            編集モード
          </button>
        </li>
      </ul>
    </div>
  );
};
