import type { Course, JaEn, Language, Question } from "../interfaces/course";
import { isCourseInLocalStorage } from "../interfaces/courseInLocalStorage";
import { useEffect, useState } from "react";

import { Choice } from "./Choice";
import { CourseEdit } from "./CourseEditor";
import axios from "axios";
import { ls } from "../libs/localStorage";
import { sentences2Elements } from "../libs/sentences2Elements";
import { useClickedQuestion } from "../hooks/useClickedQuestion";
import { Header } from "./header";
import { Heading } from "./Heading";
import { translate } from "../libs/translate";
import { compareDocumentPosition } from "domutils";

export const CourseComponent = () => {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [preferLang, setPreferLang] = useState<Language>("ja");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isCacheMode, setIsCacheMode] = useState<boolean>(false);
  // const clickedQuestion = useClickedQuestion();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [shouldTranslateAll, setShouldTranslateAll] = useState(false);
  const [isAllTranslating, setIsAllTranslating] = useState(false);
  const [currentTranslateIndex, setCurrentTranslateIndex] = useState<{
    questionIndex: number;
    text: string;
  }>({ questionIndex: 0, text: "" });

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
          const course: Course = JSON.parse(courseInLocalStorage.course);
          course.questions.forEach((question) => {
            question.question.isTranslating = false;
            question.choices.forEach(
              (choice) => (choice.isTranslating = false)
            );
            question.selects = [];
          });
          setCourse(course);
          setIsCacheMode(true);
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

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(() => resolve(1), ms));

  const shouldTranslate = (jaEn: JaEn): boolean => {
    const en = jaEn.en;
    if (!en) return false;
    if (jaEn.ja) return false;
    return true;
  };

  useEffect(() => {
    if (shouldTranslateAll && !isAllTranslating) {
      translateAll();
    }
  }, [shouldTranslateAll, isAllTranslating]);

  const updateCurrentTranslateIndex = (questionIndex: number, text: string) => {
    setCurrentTranslateIndex({
      questionIndex,
      text,
    });
  };

  const translateAll = async () => {
    setIsAllTranslating(true);
    const questions = course?.questions;
    if (!questions) return;
    let done = false;

    for (const [questionIndexStr, { choices }] of Object.entries(questions)) {
      const questionIndex = Number(questionIndexStr);
      updateCurrentTranslateIndex(questionIndex, "問題文");

      if (
        await translateJaEn(
          (course) => course.questions[questionIndex]?.question
        )
      ) {
        done = true;
        break;
      }

      for (const [choiceIndexStr] of Object.entries(choices)) {
        const choiceIndex = Number(choiceIndexStr);
        updateCurrentTranslateIndex(questionIndex, `選択肢 ${choiceIndex + 1}`);
        if (
          await translateJaEn(
            (course) => course.questions[questionIndex]?.choices[choiceIndex]
          )
        ) {
          done = true;
          break;
        }
      }

      updateCurrentTranslateIndex(questionIndex, "説明文");
      if (
        await translateJaEn(
          (course) => course.questions[questionIndex]?.explanation
        )
      ) {
        done = true;
        break;
      }

      if (done) break;
    }
    if (!done) {
      setShouldTranslateAll(false);
    }
    setIsAllTranslating(false);
  };

  const translateJaEn = async (
    jaEnCallback: (course: Course) => JaEn | undefined
  ): Promise<boolean> => {
    if (!courseId) return false;
    if (!course) return false;
    const jaEn = jaEnCallback(course);
    if (!jaEn) return false;
    if (!shouldTranslate(jaEn)) return false;
    jaEn.isTranslating = true;
    setCourse(JSON.parse(JSON.stringify(course)));

    const en = jaEn.en;
    if (!en) return false;
    const ja = await translate(typeof en === "string" ? en : en.join("\n"));
    jaEn.ja = ja;
    jaEn.isTranslating = false;
    setCourse(JSON.parse(JSON.stringify(course)));

    if (course) ls.saveCourse(course, courseId);
    return true;
  };

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

  const updateCourse = async (
    coursePipe: (course: Course) => Course | null
  ) => {
    const courseClone = JSON.parse(JSON.stringify(course));
    const updatedCourse = coursePipe(courseClone);
    if (!updatedCourse) return;
    setCourse(updatedCourse);
    await sleep(100);
  };

  const selectChoice = async (questionIndex: number, choiceIndex: number) => {
    updateCourse((course) => {
      const question = course?.questions[questionIndex];
      if (!question) return null;
      if (question.selects.includes(choiceIndex)) {
        question.selects = question.selects.filter(
          (selectIndex) => selectIndex !== choiceIndex
        );
        return course;
      }
      question.selects = [...question.selects, choiceIndex];
      return course;
    });
  };

  const fetchCourse = async () => {
    if (!sourceUrl) return;
    const json = await axios.get(sourceUrl, {
      params: {
        timestamp: Date.now(),
      },
    });
    const course: Course = json.data;
    course.questions.forEach((question) => (question.selects = []));
    setCourse(course);
  };

  useEffect(() => {
    setTimeout(restoreScroll, 100);
  }, [isEditMode]);

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

  const Footer = () => (
    <footer className="bg-main w-full h-32 absolute bottom-0 grid place-content-center">
      <small className="text-white font-bold">
        Copyright © Michinosuke All Rights Reserved.
      </small>
    </footer>
  );

  if (!course && !sourceUrl) {
    return (
      <div className="w-full max-w-3xl mx-auto min-h-screen relative pb-32">
        <Header />
        <div className="px-5 py-5 mt-10">
          <form action="" className="py-3 px-5 border">
            <Heading>JSONをURLから取得</Heading>
            <div className="flex gap-5 mt-5">
              <input
                name="source"
                placeholder="https://exam.blue/nazonazo.json"
                value="https://exam.blue/pas.json"
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
            <Heading>JSONをローカルファイルから取得</Heading>
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
          <a href="/caches">
            <button className="px-3 py-2 rounded-lg shadow-lg mt-10 bg-white hover:-translate-y-1">
              編集中のコース一覧
            </button>
          </a>
        </div>
        <Footer />
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
          translateJaEn,
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto min-h-screen relative pb-32">
      <Header />
      <div className="sm:px-3 py-3">
        {course.meta?.title && (
          <div className="flex flex-col gap-5 mt-10 bg-white px-5 py-5 rounded-lg shadow">
            <h1 className="text-xl font-extrabold">{course.meta.title}</h1>
          </div>
        )}
        <div className="flex flex-col gap-8 mt-10 bg-white px-5 py-10 rounded-lg shadow">
          <div className="mt-2">
            <Heading>概要</Heading>
            {course.meta?.description &&
              sentences2Elements({
                sentences: course.meta.description,
                textType: course.meta.text_type,
                language: preferLang,
                className: "mt-2",
              })}
          </div>
          <div className="mt-2">
            <Heading>メタデータ</Heading>
            <ul>
              <li className="before:content-['-'] before:font-bold before:text-lg before:text-main flex items-center gap-2 pl-5 pt-3">
                問題数: {course.questions.length}
              </li>
              <li className="before:content-['-'] before:font-bold before:text-lg before:text-main flex items-center gap-2 pl-5">
                解説の数:{" "}
                {
                  course.questions.filter(
                    (question) => question.explanation?.ja
                  ).length
                }
              </li>
              <li className="before:content-['-'] before:font-bold before:text-lg before:text-main flex items-center gap-2 pl-5">
                解説の充実率:{" "}
                {Math.floor(
                  (course.questions.filter(
                    (question) => question.explanation?.ja
                  ).length /
                    course.questions.length) *
                    1000
                ) / 10}
                %
              </li>
            </ul>
          </div>
          <div>
            <Heading>作者</Heading>
            <div className="flex gap-3 items-center mt-2">
              {course.meta?.author?.icon_url && (
                <div
                  className="rounded-full bg-cover bg-center w-20 h-20"
                  style={{
                    backgroundImage: `url(${course.meta.author.icon_url})`,
                  }}
                />
              )}
              {course.meta?.author?.name && (
                <span className="">{course.meta.author.name}</span>
              )}
            </div>
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
              className="bg-white pt-10 rounded-lg shadow overflow-hidden"
            >
              <h2 className="text-lg font-bold px-5">
                {isCacheMode ? (
                  <>
                    <span className="text-bold text-main">Q. </span>
                    {questionIndex + 1}
                  </>
                ) : (
                  <a
                    href={
                      "./?" +
                      new URLSearchParams([
                        ...new URLSearchParams(
                          window.location.search
                        ).entries(),
                        ["q", (questionIndex + 1).toString()],
                      ])
                    }
                    className="hover:opacity-70"
                  >
                    <span className="text-bold text-main">Q. </span>
                    {questionIndex + 1}
                  </a>
                )}
              </h2>
              {sentences2Elements({
                sentences: question.question,
                textType: course.meta?.text_type,
                language: preferLang,
                className: "mt-2 px-5",
              })}
              {question.corrects.length > 1 && (
                <p className="px-3">
                  （ {question.corrects.length} つ選択してください。）
                </p>
              )}
              <ul className="flex flex-col gap-4 my-5 px-3 pb-5">
                {question.choices.map((choice, choiceIndex) => (
                  <Choice
                    choice={choice}
                    status={(() => {
                      if (question.selects.length >= question.corrects.length) {
                        if (question.corrects.includes(choiceIndex + 1)) {
                          return "correct";
                        }
                        return "incorrect";
                      }
                      return "default";
                    })()}
                    selected={question.selects.includes(choiceIndex)}
                    key={choiceIndex}
                    index={choiceIndex}
                    preferLang={preferLang}
                    textType={course.meta?.text_type}
                    onClick={() => {
                      if (question.selects.length >= question.corrects.length) {
                        updateCourse((course) => {
                          const question = course.questions[questionIndex];
                          if (!question) return null;
                          question.selects = [];
                          return course;
                        });
                      } else {
                        selectChoice(questionIndex, choiceIndex);
                      }
                    }}
                    multiple={question.corrects.length > 1}
                  />
                ))}
              </ul>
              {question.explanation && (
                <div
                  className={`px-5 bg-[#e7f2f2] ${
                    question.selects &&
                    question.selects.length >= question.corrects.length
                      ? "display-active py-10"
                      : "display-none"
                  }`}
                  style={{
                    boxShadow: "0 20 20 0 #000 inset",
                  }}
                >
                  <h3 className="text-lg font-bold">解説</h3>
                  {sentences2Elements({
                    sentences: question.explanation,
                    textType: course.meta?.text_type,
                    language: preferLang,
                    className: "mt-5",
                  })}
                </div>
              )}
            </li>
          ))}
        </ul>
        <ul className="fixed bottom-10 left-10 flex gap-3 z-10">
          <li>
            <button
              onClick={() => setPreferLang(preferLang === "ja" ? "en" : "ja")}
              className="bg-white px-3 py-2 rounded-md shadow-lg"
            >
              優先言語：{preferLang === "ja" ? "日本語" : "英語"}
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
              編集
            </button>
          </li>
          <li>
            <button
              onClick={() => (location.href = "/caches")}
              className="bg-white px-3 py-2 rounded-md shadow-lg"
            >
              編集中のコース一覧
            </button>
          </li>
          <li>
            <button
              onClick={() => setShouldTranslateAll(!shouldTranslateAll)}
              className="bg-white px-3 py-2 rounded-md shadow-lg"
            >
              {shouldTranslateAll
                ? `全て翻訳モード実行中(${
                    currentTranslateIndex.questionIndex + 1
                  } - ${currentTranslateIndex.text})`
                : "全て翻訳モード停止中"}
            </button>
          </li>
        </ul>
        {isCacheMode && (
          <div className="bg-red-500 text-white px-3 py-2 rounded-md fixed top-5 left-5 shadow-lg">
            ローカル編集モード
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
