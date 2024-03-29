import { GptUsage, translate } from "../libs/translate";
import type {
  UIExam,
  UIJaEn,
  UILanguage,
  UIQuestion,
} from "../interfaces/uiExam";
import { useCallback, useEffect, useState } from "react";

import { ABC } from "../libs/abc";
import { Choice } from "./Choice";
import type { Exam } from "../interfaces/exam";
import { ExamEdit } from "./ExamEditor";
import { FixedButtons } from "./FixedButtons";
import { Header } from "./header";
import { Heading } from "./Heading";
import axios from "axios";
import { breakUdemy } from "../libs/udemy";
import { dumpExam } from "../libs/dumpExam";
import { dumpUdemyCsv } from "../libs/dumpUdemyCsv";
import { format } from "date-fns";
import { isExamInLocalStorage } from "../interfaces/examInLocalStorage";
import { ls } from "../libs/localStorage";
import { remote } from "../libs/remote";
import { sentences2Elements } from "../libs/sentences2Elements";
import { transformer } from "../libs/examConverter";
import { DoughnutChart } from "./DoughnutChart";
import { Discussions } from "./Discussion";

export const ExamComponent = () => {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [exam, setExam] = useState<UIExam | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [preferLang, setPreferLang] = useState<UILanguage>("ja");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isCacheMode, setIsCacheMode] = useState<boolean>(false);
  const [examId, setExamId] = useState<string | null>(null);
  const [shouldTranslateAll, setShouldTranslateAll] = useState(false);
  const [isAllTranslating, setIsAllTranslating] = useState(false);
  const [currentTranslateIndex, setCurrentTranslateIndex] = useState<{
    questionIndex: number;
    text: string;
  }>({ questionIndex: 0, text: "" });
  const [totalTranslateToken, setTotalTranslateToken] = useState<GptUsage>({
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0,
  });

  const [isHeaderShown, setIsHeaderShown] = useState(true);
  const [lastPosition, setLastPosition] = useState(0);
  const headerHeight = 40;

  const scrollEvent = useCallback(() => {
    const offset = window.pageYOffset;

    if (offset > headerHeight) {
      setIsHeaderShown(false);
    } else {
      setIsHeaderShown(true);
    }

    if (offset < lastPosition) {
      setIsHeaderShown(true);
    }

    setLastPosition(offset);
  }, [lastPosition]);

  useEffect(() => {
    window.addEventListener("scroll", scrollEvent);

    return () => {
      window.removeEventListener("scroll", scrollEvent);
    };
  }, [scrollEvent]);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const examId = search.get("cache");
    if (examId) {
      setExamId(examId);
      const examKey = `exam.${examId}`;
      const cache = localStorage.getItem(examKey);
      if (!cache) {
        console.log(`cache key exam.${examId} not found.`);
        return;
      }
      const examInLocalStorage: object | null = (() => {
        try {
          return JSON.parse(cache);
        } catch (e) {
          return null;
        }
      })();
      if (!examInLocalStorage) throw new Error("パースエラー");
      if (isExamInLocalStorage(examInLocalStorage)) {
        const exam: Exam | null = (() => {
          try {
            return JSON.parse(examInLocalStorage.exam);
          } catch (e) {
            return null;
          }
        })();
        if (!exam) throw new Error("パースエラー");
        const uiExam = transformer.exam.exam2ui(exam);
        setExam(uiExam);
        setIsCacheMode(true);
      } else {
        console.log("exam in local storage is invalid.");
      }
    } else {
      const source = search.get("source");
      if (!source) return;
      setSourceUrl(source);
    }
    // getFileInLocalStorage();
  }, []);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(() => resolve(1), ms));

  const shouldTranslate = (jaEn?: UIJaEn): boolean => {
    if (!jaEn) return false;
    if (jaEn.isTranslating) return false;

    if (!jaEn.en) return false;

    const ja: string = typeof jaEn.ja === "string" ? jaEn.ja : "";
    if (ja !== "") return false;

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
    const questions = exam?.questions;
    if (!questions) return;
    let done = false;

    for (const [questionIndexStr, { choices }] of Object.entries(questions)) {
      const questionIndex = Number(questionIndexStr);
      scrollByQuestionNum(questionIndex + 1);
      updateCurrentTranslateIndex(questionIndex, "問題文");

      if (
        await translateJaEn((exam) => exam.questions[questionIndex]?.statement)
      ) {
        done = true;
        break;
      }

      for (const [choiceIndexStr] of Object.entries(choices)) {
        const choiceIndex = Number(choiceIndexStr);
        updateCurrentTranslateIndex(questionIndex, `選択肢 ${choiceIndex + 1}`);
        if (
          await translateJaEn(
            (exam) => exam.questions[questionIndex]?.choices[choiceIndex]
          )
        ) {
          done = true;
          break;
        }
      }

      updateCurrentTranslateIndex(questionIndex, "説明文");
      if (
        await translateJaEn(
          (exam) => exam.questions[questionIndex]?.explanation
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
    jaEnCallback: (exam: UIExam) => UIJaEn | undefined | null
  ): Promise<boolean> => {
    if (!examId) return false;
    if (!exam) return false;
    const jaEn = jaEnCallback(exam);
    if (!jaEn) return false;

    if (!shouldTranslate(jaEn)) return false;

    const en = jaEn.en;
    if (!en) return false;

    jaEn.isTranslating = true;
    setExam(JSON.parse(JSON.stringify(exam)));

    const res = await translate(en);

    jaEn.isTranslating = false;
    setExam(JSON.parse(JSON.stringify(exam)));

    if (!res) return false;
    jaEn.ja = res.message;
    setExam(JSON.parse(JSON.stringify(exam)));

    return true;
  };

  const scrollByQuestionNum = (questionNum: number) => {
    const questionId = `question-${questionNum}`;
    const question = document.getElementById(questionId);
    if (!question) return;
    question.scrollIntoView({
      behavior: "smooth",
    });
  };

  const saveMouseEnterQuestion = (questionIndex: number) => {
    localStorage.setItem(
      `focusedQuestionNum.${sourceUrl ?? examId}`,
      (questionIndex + 1).toString()
    );
  };

  const restoreScroll = () => {
    const q = new URLSearchParams(window.location.search).get("q");
    const questionNum =
      q ?? localStorage.getItem(`focusedQuestionNum.${sourceUrl ?? examId}`);
    if (!questionNum) return;
    scrollByQuestionNum(parseInt(questionNum, 10));
  };

  const updateExam = async (examPipe: (exam: UIExam) => UIExam | null) => {
    const examClone = JSON.parse(JSON.stringify(exam));
    const updatedExam = examPipe(examClone);
    if (JSON.stringify(exam) === JSON.stringify(updatedExam)) return;
    if (!updatedExam) return;
    setExam(updatedExam);
    await sleep(100);
  };

  const addQuestion = async (newQuestionIndex: number) => {
    const newQuestion: UIQuestion = {
      choices: [
        {
          ja: "",
          en: "",
          isTranslating: false,
        },
        {
          ja: "",
          en: "",
          isTranslating: false,
        },
        {
          ja: "",
          en: "",
          isTranslating: false,
        },
        {
          ja: "",
          en: "",
          isTranslating: false,
        },
      ],
      corrects: [],
      selects: [],
      statement: {
        ja: "",
        en: "",
        isTranslating: false,
      },
      explanation: {
        ja: "",
        en: "",
        isTranslating: false,
      },
      discussions: [],
      isExpandedDiscussion: false,
      votes: [],
    };
    updateExam((exam) => {
      exam.questions.splice(newQuestionIndex, 0, newQuestion);
      return exam;
    });
  };

  const removeQuestion = async (questionIndex: number) => {
    if (!confirm(`問題 ${questionIndex + 1} を削除しますか？`)) return;
    updateExam((exam) => {
      exam.questions.splice(questionIndex, 1);
      return exam;
    });
  };

  const addChoice = async (questionIndex: number) => {
    const newChoice: UIJaEn = {
      ja: "",
      en: "",
      isTranslating: false,
    };
    updateExam((exam) => {
      const question = exam.questions[questionIndex];
      if (!question) return null;
      question.choices.push(newChoice);
      return exam;
    });
  };

  const removeChoice = async (questionIndex: number, choiceIndex: number) => {
    if (!confirm(`選択肢を削除しますか？`)) return;
    updateExam((exam) => {
      const question = exam.questions[questionIndex];
      if (!question) return null;
      question.choices.splice(choiceIndex, 1);
      return exam;
    });
  };

  const toggleCorrect = async (questionIndex: number, choiceIndex: number) => {
    updateExam((exam) => {
      const question = exam.questions[questionIndex];
      if (!question) return null;
      if (question.corrects.includes(choiceIndex + 1)) {
        question.corrects = question.corrects.filter(
          (correct) => correct !== choiceIndex + 1
        );
      } else {
        question.corrects = [
          ...new Set([...question.corrects, choiceIndex + 1]),
        ];
      }
      return exam;
    });
  };

  const selectChoice = async (questionIndex: number, choiceIndex: number) => {
    updateExam((exam) => {
      const question = exam?.questions[questionIndex];
      if (!question) return null;
      if (question.selects.includes(choiceIndex)) {
        question.selects = question.selects.filter(
          (selectIndex) => selectIndex !== choiceIndex
        );
        return exam;
      }
      question.selects = [...question.selects, choiceIndex];
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
    const uiExam: UIExam = transformer.exam.exam2ui(exam);
    setExam(uiExam);
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
    if (exam?.meta?.title) {
      document.title = exam.meta.title;
    }
    setTotalTranslateToken(ls.getTotalTranslateToken());
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
          saveMouseEnterQuestion,
          updateExam,
          setIsEditMode,
          translateJaEn,
          shouldTranslate,
          addQuestion,
          removeQuestion,
          addChoice,
          removeChoice,
          toggleCorrect,
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto min-h-screen relative pb-[30rem]">
      <Header />
      {exam.meta?.title && (
        <div className="mt-10 bg-white px-5 h-10 sticky top-0 z-30 grid content-center w-full">
          <h1
            className="text-lg font-bold text-slate-800 overflow-ellipsis whitespace-nowrap overflow-hidden"
            title={exam.meta.title}
          >
            {exam.meta.title}
          </h1>
        </div>
      )}
      <div>
        <div className="py-3">
          {/* {exam.meta?.title && (
            <div className="flex flex-col gap-5 mt-10 bg-white px-5 py-5 rounded-lg shadow sticky">
              <h1 className="text-xl font-extrabold">{exam.meta.title}</h1>
            </div>
          )} */}
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
                  問題数: {exam.questions.length}
                </li>
                <li className="before:content-['-'] before:font-bold before:text-lg before:text-main flex items-center gap-2 pl-5">
                  解説の数:{" "}
                  {
                    exam.questions.filter(
                      (question) => question.explanation?.ja
                    ).length
                  }
                </li>
                <li className="before:content-['-'] before:font-bold before:text-lg before:text-main flex items-center gap-2 pl-5">
                  解説の充実率:{" "}
                  {Math.floor(
                    (exam.questions.filter(
                      (question) => question.explanation?.ja
                    ).length /
                      exam.questions.length) *
                      1000
                  ) / 10}
                  %
                </li>
              </ul>
            </div>
            <div>
              <Heading>作者</Heading>
              <div className="flex gap-3 items-center mt-2 hover:bg-[hsl(180,100%,97%)]">
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
            {exam.questions.map((question, questionIndex) => (
              <li
                key={questionIndex}
                id={`question-${questionIndex + 1}`}
                onMouseEnter={() =>
                  initialized && saveMouseEnterQuestion(questionIndex)
                }
                className="bg-white pt-10 rounded-lg shadow relative"
              >
                <h2 className="text-lg font-bold px-5 flex justify-between sticky top-10 bg-white">
                  {isCacheMode ? (
                    <div>
                      <span className="text-bold text-main">Q. </span>
                      {questionIndex + 1}
                    </div>
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
                      <span className="text-slate-500 font-normal pl-4">
                        {question.heading}
                      </span>
                    </a>
                  )}
                </h2>

                <button
                  className="bg-slate-300 hover:bg-slate-400 active:scale-105 transition-all px-2 py-0.5 rounded text-white text-xs absolute top-5 right-5"
                  onClick={() => {
                    const prompt = [
                      "以下の問題の最高に丁寧な解説を作成してください。",
                      question.statement[preferLang],
                      question.choices
                        .map((choice, choiceIndex) => {
                          const abc = ABC[choiceIndex];
                          return `- ${abc} : ${choice[preferLang]}`;
                        })
                        .join("\n\n"),
                    ].join("\n\n");
                    navigator.clipboard.writeText(prompt);
                  }}
                >
                  Copy Prompt
                </button>

                {sentences2Elements({
                  sentences: question.statement,
                  textType: exam.meta?.text_type,
                  language: preferLang,
                  className: "mt-2 px-5",
                })}
                {question.corrects.length > 1 && (
                  <span className="inline-block mx-5 px-3 py-0.5 bg-main text-white rounded">
                    {question.corrects.length} つ選択
                  </span>
                )}
                <ul className="flex flex-col gap-4 my-5 px-3 pb-5">
                  {question.choices.map((choice, choiceIndex) => (
                    <Choice
                      choice={choice}
                      status={(() => {
                        if (
                          question.selects.length >= question.corrects.length
                        ) {
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
                      textType={exam.meta?.text_type}
                      onClick={() => {
                        if (
                          question.selects.length >= question.corrects.length
                        ) {
                          updateExam((exam) => {
                            const question = exam.questions[questionIndex];
                            if (!question) return null;
                            question.selects = [];
                            return exam;
                          });
                        } else {
                          selectChoice(questionIndex, choiceIndex);
                        }
                      }}
                      multiple={question.corrects.length > 1}
                    />
                  ))}
                </ul>
                <div
                  className={`px-5 bg-[hsl(180,50%,96%)] ${
                    question.selects &&
                    question.selects.length >= question.corrects.length
                      ? "display-active py-10"
                      : "display-none"
                  }`}
                  style={{
                    boxShadow: "0 20 20 0 #000 inset",
                  }}
                >
                  {(question.explanation["ja"] ||
                    question.explanation["en"]) && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-600">解説</h3>
                      {sentences2Elements({
                        sentences: question.explanation,
                        textType: exam.meta.text_type,
                        language: preferLang,
                        mode: "prefer",
                        className: "mt-5",
                      })}
                    </div>
                  )}
                  {question.votes.length > 0 && (
                    <div className="mt-10">
                      <h3 className="text-lg font-bold text-gray-600 pb-3">
                        ユーザの投票
                      </h3>
                      <DoughnutChart
                        data={question.votes.map(({ label, count }) => ({
                          label: label || "その他",
                          count,
                        }))}
                      />
                    </div>
                  )}
                  {question.discussions.length > 0 && (
                    <div className="mt-10">
                      <h3 className="text-lg font-bold text-gray-600 pb-3">
                        コメント({question.discussions.length})
                      </h3>
                      <Discussions
                        discussions={
                          question.isExpandedDiscussion
                            ? question.discussions
                            : question.discussions
                                .slice(0, 3)
                                .map((discussion) => ({
                                  ...discussion,
                                  replies: [],
                                }))
                        }
                        preferLang={preferLang}
                        textType={exam.meta.text_type}
                      />
                      {!question.isExpandedDiscussion && (
                        <button
                          className="bg-main rounded-md px-3 py-1 mt-3 text-white block mx-auto"
                          onClick={() => {
                            updateExam((exam) => {
                              const question = exam.questions[questionIndex];
                              if (!question) return null;
                              question.isExpandedDiscussion =
                                !question.isExpandedDiscussion;
                              return exam;
                            });
                          }}
                        >
                          {question.isExpandedDiscussion
                            ? "閉じる"
                            : "もっとみる"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div></div>
      </div>

      <FixedButtons
        buttons={[
          {
            text: isCacheMode ? `ローカル編集モード` : null,
            className: "bg-main text-white",
          },
          {
            text: `翻訳にかかった料金: ${
              Math.floor(
                (totalTranslateToken.total_tokens * 0.002 * 135) / 10
              ) / 100
            } 円`,
          },
          {
            onClick: async () => {
              const { examUrl } = await remote.save(exam, examId);
              updateExam((exam) => {
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
            onClick: () => dumpExam(exam),
            text: "ダウンロード",
          },
          {
            onClick: () => (location.href = "/caches"),
            text: "編集中のコース一覧",
          },
          {
            onClick: () => {
              if (shouldTranslateAll) {
                setShouldTranslateAll(false);
                return;
              }
              if (
                confirm(
                  [
                    "全て翻訳モードが有効化されている間、未翻訳の全ての設問の問題文、選択肢、解説を自動で翻訳します。",
                    "翻訳には gpt-3.5-turbo を使用しています。",
                    "利用料金がかかっているので、資格勉強以外の用途での使用はご遠慮ください。",
                    "全て翻訳モードを有効化しますか？",
                  ].join("\n\n")
                )
              ) {
                setShouldTranslateAll(true);
              }
            },
            text: shouldTranslateAll
              ? `全て翻訳モード実行中(${
                  currentTranslateIndex.questionIndex + 1
                } - ${currentTranslateIndex.text})`
              : "全て翻訳モード停止中",
          },
          {
            text: "Export to Udemy",
            onClick: () => dumpUdemyCsv({ exam, preferLang }),
          },
          {
            text: "Break Udemy",
            onClick: () => breakUdemy(),
          },
        ]}
      />
      <Footer />
    </div>
  );
};
