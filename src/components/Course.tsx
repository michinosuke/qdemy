import type { Course, Language } from "../interfaces/course";
import { isCourseInLocalStorage } from "../interfaces/courseInLocalStorage";
import { useEffect, useState } from "react";

import { Choice } from "./Choice";
import { CourseEdit } from "./CourseEditor";
import axios from "axios";
import { ls } from "../libs/localStorage";
import { sentences2Elements } from "../libs/sentences2Elements";
import { useClickedQuestion } from "../hooks/useClickedQuestion";
import { ulid } from "ulid";

export const CourseComponent = () => {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [preferLang, setPreferLang] = useState<Language>("ja");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isCacheMode, setIsCacheMode] = useState<boolean>(false);
  const clickedQuestion = useClickedQuestion();

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const ulid = search.get("cache");
    if (ulid) {
      try {
        const courseKey = `course.${ulid}`;
        const cache = localStorage.getItem(courseKey);
        if (isCourseInLocalStorage(cache)) {
          const course = JSON.parse(cache);
          setCourse(course);
          setIsCacheMode(true);
          setIsEditMode(true);
          return;
        }
        console.log(`cache key course.${ulid} not found.`);
      } catch (e) {}
    }
    const source = search.get("source");
    setSourceUrl(source);
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
    if (course) ls.saveCourse(course);
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
      <div className="flex flex-col gap-5">
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
              } else if (
                window.confirm(`編集する時のための、ブラウザに保存されたコースを表示されたモードです。
編集後にリロードしても、編集内容が保存されます。
キャッシュモードを抜ける前には、必ず保存ボタンを押して、変更内容をjson形式で保存してください。`)
              ) {
                window.location.href = `?cache=${ls.saveCourse(course)}Ude`;
              }
            }}
          >
            編集モード
          </button>
        </li>
      </ul>
    </div>
  );
};
