import type { Exam, Language, UIJaEn } from "../interfaces/exam";
import { isExamInLocalStorage } from "../interfaces/examInLocalStorage";
import { useEffect, useState } from "react";

import { Choice } from "./Choice";
import { ExamEdit } from "./ExamEditor";
import axios from "axios";
import { ls } from "../libs/localStorage";
import { sentences2Elements } from "../libs/sentences2Elements";
import { Header } from "./header";
import { Heading } from "./Heading";
import { translate } from "../libs/translate";
import { FixedButtons } from "./FixedButtons";
import { remote } from "../libs/remote";
import { format } from "date-fns";

export const ExamComponent = () => {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [preferLang, setPreferLang] = useState<Language>("ja");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isCacheMode, setIsCacheMode] = useState<boolean>(false);
  const [examId, setExamId] = useState<string | null>(null);
  const [shouldTranslateAll, setShouldTranslateAll] = useState(false);
  const [isAllTranslating, setIsAllTranslating] = useState(false);
  const [currentTranslateIndex, setCurrentTranslateIndex] = useState<{
    problemIndex: number;
    text: string;
  }>({ problemIndex: 0, text: "" });

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const examId = search.get("cache");
    if (examId) {
      setExamId(examId);
      try {
        const examKey = `exam.${examId}`;
        const cache = localStorage.getItem(examKey);
        if (!cache) {
          console.log(`cache key exam.${examId} not found.`);
          return;
        }
        const examInLocalStorage = JSON.parse(cache);
        if (isExamInLocalStorage(examInLocalStorage)) {
          const exam: Exam = JSON.parse(examInLocalStorage.exam);
          exam.problems.forEach((problem) => {
            problem.statement.isTranslating = false;
            problem.choices.forEach((choice) => (choice.isTranslating = false));
            problem.selects = [];
          });
          setExam(exam);
          setIsCacheMode(true);
        } else {
          console.log("exam in local storage is invalid.");
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

  const shouldTranslate = (jaEn: UIJaEn): boolean => {
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

  const updateCurrentTranslateIndex = (problemIndex: number, text: string) => {
    setCurrentTranslateIndex({
      problemIndex,
      text,
    });
  };

  const translateAll = async () => {
    setIsAllTranslating(true);
    const problems = exam?.problems;
    if (!problems) return;
    let done = false;

    for (const [problemIndexStr, { choices }] of Object.entries(problems)) {
      const problemIndex = Number(problemIndexStr);
      updateCurrentTranslateIndex(problemIndex, "問題文");

      if (
        await translateJaEn((exam) => exam.problems[problemIndex]?.statement)
      ) {
        done = true;
        break;
      }

      for (const [choiceIndexStr] of Object.entries(choices)) {
        const choiceIndex = Number(choiceIndexStr);
        updateCurrentTranslateIndex(problemIndex, `選択肢 ${choiceIndex + 1}`);
        if (
          await translateJaEn(
            (exam) => exam.problems[problemIndex]?.choices[choiceIndex]
          )
        ) {
          done = true;
          break;
        }
      }

      updateCurrentTranslateIndex(problemIndex, "説明文");
      if (
        await translateJaEn((exam) => exam.problems[problemIndex]?.explanation)
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
    jaEnCallback: (exam: Exam) => UIJaEn | undefined
  ): Promise<boolean> => {
    if (!examId) return false;
    if (!exam) return false;
    const jaEn = jaEnCallback(exam);
    if (!jaEn) return false;
    if (!shouldTranslate(jaEn)) return false;
    jaEn.isTranslating = true;
    setExam(JSON.parse(JSON.stringify(exam)));

    const en = jaEn.en;
    if (!en) return false;
    const ja = await translate(typeof en === "string" ? en : en.join("\n"));
    jaEn.ja = ja;
    jaEn.isTranslating = false;
    setExam(JSON.parse(JSON.stringify(exam)));

    // if (exam) ls.saveExam(exam, examId);
    return true;
  };

  const saveMouseEnterProblem = (problemId: string) => {
    localStorage.setItem(`focusedProblemId.${sourceUrl ?? examId}`, problemId);
  };

  const restoreScroll = () => {
    const q = new URLSearchParams(window.location.search).get("q");
    const problemId = q
      ? `problem-${q}`
      : localStorage.getItem(`focusedProblemId.${sourceUrl ?? examId}`);
    if (!problemId) return;
    const problem = document.getElementById(problemId);
    if (problem) {
      problem.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  const updateExam = async (examPipe: (exam: Exam) => Exam | null) => {
    const examClone = JSON.parse(JSON.stringify(exam));
    const updatedExam = examPipe(examClone);
    if (JSON.stringify(exam) === JSON.stringify(updatedExam)) return;
    if (!updatedExam) return;
    setExam(updatedExam);
    await sleep(100);
  };

  const selectChoice = async (problemIndex: number, choiceIndex: number) => {
    updateExam((exam) => {
      const problem = exam?.problems[problemIndex];
      if (!problem) return null;
      if (problem.selects.includes(choiceIndex)) {
        problem.selects = problem.selects.filter(
          (selectIndex) => selectIndex !== choiceIndex
        );
        return exam;
      }
      problem.selects = [...problem.selects, choiceIndex];
      return exam;
    });
  };

  const fetchExam = async () => {
    if (!sourceUrl) return;
    const json = await axios.get(sourceUrl, {
      params: {
        timestamp: Date.now(),
      },
    });
    const exam: Exam = json.data;
    exam.problems.forEach((problem) => (problem.selects = []));
    setExam(exam);
  };

  useEffect(() => {
    setTimeout(restoreScroll, 100);
  }, [isEditMode, preferLang]);

  useEffect(() => {
    fetchExam();
  }, [sourceUrl]);

  useEffect(() => {
    if (!initialized) {
      setTimeout(restoreScroll, 100);
      setTimeout(() => setInitialized(true), 3000);
    }
    if (exam && examId) {
      ls.saveExam(exam, examId);
    }
  }, [exam]);

  const Footer = () => (
    <footer className="bg-main w-full h-96 absolute bottom-0 grid place-content-center">
      <small className="text-white font-bold">
        Copyright © Michinosuke All Rights Reserved.
      </small>
    </footer>
  );

  if (!exam) {
    return (
      <div className="grid place-content-center h-screen">
        <img src="/assets/spin.svg" />
      </div>
    );
  }

  if (isEditMode) {
    return (
      <ExamEdit
        {...{
          exam,
          initialized,
          preferLang,
          saveMouseEnterProblem,
          updateExam,
          setIsEditMode,
          translateJaEn,
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto min-h-screen relative pb-[30rem]">
      <Header />
      <div className="sm:px-3 py-3">
        {exam.meta?.title && (
          <div className="flex flex-col gap-5 mt-10 bg-white px-5 py-5 rounded-lg shadow">
            <h1 className="text-xl font-extrabold">{exam.meta.title}</h1>
          </div>
        )}
        <div className="flex flex-col gap-8 mt-10 bg-white px-5 py-10 rounded-lg shadow">
          <div className="mt-2">
            <Heading>概要</Heading>
            {exam.meta?.description &&
              sentences2Elements({
                sentences: exam.meta.description,
                textType: exam.meta.text_type,
                language: preferLang,
                className: "mt-2",
              })}
          </div>
          <div className="mt-2">
            <Heading>メタデータ</Heading>
            <ul>
              <li className="before:content-['-'] before:font-bold before:text-lg before:text-main flex items-center gap-2 pl-5 pt-3">
                問題数: {exam.problems.length}
              </li>
              <li className="before:content-['-'] before:font-bold before:text-lg before:text-main flex items-center gap-2 pl-5">
                解説の数:{" "}
                {
                  exam.problems.filter((problem) => problem.explanation?.ja)
                    .length
                }
              </li>
              <li className="before:content-['-'] before:font-bold before:text-lg before:text-main flex items-center gap-2 pl-5">
                解説の充実率:{" "}
                {Math.floor(
                  (exam.problems.filter((problem) => problem.explanation?.ja)
                    .length /
                    exam.problems.length) *
                    1000
                ) / 10}
                %
              </li>
            </ul>
          </div>
          <div>
            <Heading>作者</Heading>
            <div className="flex gap-3 items-center mt-2">
              {exam.meta?.author?.icon_url && (
                <div
                  className="rounded-full bg-cover bg-center w-20 h-20"
                  style={{
                    backgroundImage: `url(${exam.meta.author.icon_url})`,
                  }}
                />
              )}
              {exam.meta?.author?.name && (
                <span className="">{exam.meta.author.name}</span>
              )}
            </div>
          </div>
        </div>
        <ul className="flex flex-col gap-24 mt-10 pt-10 border-t-4">
          {exam.problems.map((problem, problemIndex) => (
            <li
              key={problemIndex}
              id={`problem-${problemIndex + 1}`}
              onMouseEnter={() =>
                initialized &&
                saveMouseEnterProblem(`problem-${problemIndex + 1}`)
              }
              className="bg-white pt-10 rounded-lg shadow overflow-hidden"
            >
              <h2 className="text-lg font-bold px-5">
                {isCacheMode ? (
                  <>
                    <span className="text-bold text-main">Q. </span>
                    {problemIndex + 1}
                  </>
                ) : (
                  <a
                    href={
                      "./?" +
                      new URLSearchParams([
                        ...new URLSearchParams(
                          window.location.search
                        ).entries(),
                        ["q", (problemIndex + 1).toString()],
                      ])
                    }
                    className="hover:opacity-70"
                  >
                    <span className="text-bold text-main">Q. </span>
                    {problemIndex + 1}
                  </a>
                )}
              </h2>
              {sentences2Elements({
                sentences: problem.statement,
                textType: exam.meta?.text_type,
                language: preferLang,
                className: "mt-2 px-5",
              })}
              {problem.corrects.length > 1 && (
                <span className="inline-block mx-5 px-3 py-0.5 bg-main text-white rounded">
                  {problem.corrects.length} つ選択
                </span>
              )}
              <ul className="flex flex-col gap-4 my-5 px-3 pb-5">
                {problem.choices.map((choice, choiceIndex) => (
                  <Choice
                    choice={choice}
                    status={(() => {
                      if (problem.selects.length >= problem.corrects.length) {
                        if (problem.corrects.includes(choiceIndex + 1)) {
                          return "correct";
                        }
                        return "incorrect";
                      }
                      return "default";
                    })()}
                    selected={problem.selects.includes(choiceIndex)}
                    key={choiceIndex}
                    index={choiceIndex}
                    preferLang={preferLang}
                    textType={exam.meta?.text_type}
                    onClick={() => {
                      if (problem.selects.length >= problem.corrects.length) {
                        updateExam((exam) => {
                          const question = exam.problems[problemIndex];
                          if (!question) return null;
                          problem.selects = [];
                          return exam;
                        });
                      } else {
                        selectChoice(problemIndex, choiceIndex);
                      }
                    }}
                    multiple={problem.corrects.length > 1}
                  />
                ))}
              </ul>
              {problem.explanation && (
                <div
                  className={`px-5 bg-[hsl(180,50%,96%)] ${
                    problem.selects &&
                    problem.selects.length >= problem.corrects.length
                      ? "display-active py-10"
                      : "display-none"
                  }`}
                  style={{
                    boxShadow: "0 20 20 0 #000 inset",
                  }}
                >
                  <h3 className="text-lg font-bold text-gray-600">解説</h3>
                  {sentences2Elements({
                    sentences: problem.explanation,
                    textType: exam.meta?.text_type,
                    language: preferLang,
                    className: "mt-5",
                  })}
                </div>
              )}
            </li>
          ))}
        </ul>
        <FixedButtons
          buttons={[
            {
              text: isCacheMode ? `ローカル編集モード` : null,
              className: "bg-main text-white",
            },
            {
              onClick: async () => {
                const { examUrl } = await remote.save(exam, examId);
                updateExam((exam) => {
                  if (!exam.meta) exam.meta = {};
                  exam.meta.url = examUrl;
                  exam.meta.last_uploaded_at = new Date().toISOString();
                  return exam;
                });
              },
              text: isCacheMode ? `クラウドに保存` : null,
            },
            {
              text: exam.meta?.url
                ? `クラウドに保存された模擬試験を開く(最終送信日時: ${
                    exam.meta?.last_uploaded_at
                      ? format(
                          new Date(exam.meta.last_uploaded_at),
                          "yyyy/MM/dd HH:mm:ss"
                        )
                      : "?"
                  })`
                : null,
              onClick: () => {
                if (exam.meta?.url) location.href = exam.meta.url;
              },
            },
            {
              onClick: () => setPreferLang(preferLang === "ja" ? "en" : "ja"),
              text: `優先言語：${preferLang === "ja" ? "日本語" : "英語"}`,
            },
            {
              onClick: () => {
                if (isCacheMode) {
                  setIsEditMode(!isEditMode);
                  return;
                }
                if (
                  confirm(
                    `現在、インターネット上の模擬試験を表示しています。\n編集するには、この模擬試験をブラウザにコピーし、「ローカル編集モード」に移行する必要があります。\n「ローカル編集モード」に移行しますか？`
                  )
                ) {
                  window.location.href = `?cache=${ls.saveExam(exam)}`;
                }
              },
              text: "編集",
            },
            {
              onClick: () => (location.href = "/caches"),
              text: "編集中のコース一覧",
            },
            // {
            //   onClick: () => setShouldTranslateAll(!shouldTranslateAll),
            //   text: shouldTranslateAll
            //     ? `全て翻訳モード実行中(${
            //         currentTranslateIndex.statementIndex + 1
            //       } - ${currentTranslateIndex.text})`
            //     : "全て翻訳モード停止中",
            // },
          ]}
        />
      </div>
      <Footer />
    </div>
  );
};
