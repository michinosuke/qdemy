import { ABC } from "../libs/abc";
import { FC, useEffect, useState } from "react";
import { FixedButtons } from "./FixedButtons";
import { Header } from "./header";
import { Heading } from "./Heading";
import { dumpExam } from "../libs/dumpExam";
import { sentences2Elements } from "../libs/sentences2Elements";
import axios from "axios";
import type {
  UIExam,
  UIJaEn,
  UILanguage,
  UITextType,
} from "../interfaces/uiExam";

type Props = {
  exam: UIExam;
  updateExam: (examPipe: (exam: UIExam) => UIExam | null) => void;
  preferLang: UILanguage;
  initialized: boolean;
  saveMouseEnterQuestion: (questionIndex: number) => void;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  shouldTranslate: (jaEn?: UIJaEn) => boolean;
  translateJaEn: (
    jaEnCallback: (exam: UIExam) => UIJaEn | undefined
  ) => Promise<boolean>;
  addQuestion: (newQuestionIndex: number) => Promise<void>;
  removeQuestion: (questionIndex: number) => Promise<void>;
  addChoice: (questionIndex: number) => Promise<void>;
  removeChoice: (questionIndex: number, choiceIndex: number) => Promise<void>;
  toggleCorrect: (questionIndex: number, choiceIndex: number) => Promise<void>;
};

export const ExamEdit: FC<Props> = ({
  exam,
  updateExam,
  preferLang,
  initialized,
  saveMouseEnterQuestion,
  setIsEditMode,
  translateJaEn,
  shouldTranslate,
  addQuestion,
  removeQuestion,
  addChoice,
  removeChoice,
  toggleCorrect,
}) => {
  const [jsons, setJsons] = useState<
    { jsonUrl: string; exam: UIExam | null | false }[]
  >([]);
  const [jsonUrl, setJsonUrl] = useState<string>("");

  const fetchJsons = async () => {
    if (!jsons.find((json) => json.exam === null)) return;

    const jsonsCopy: { jsonUrl: string; exam: UIExam | null }[] = JSON.parse(
      JSON.stringify(jsons)
    );
    const updatedJsons = await Promise.all(
      jsonsCopy.map(async ({ jsonUrl, exam }) => {
        if (exam) {
          return { jsonUrl, exam };
        }
        try {
          const { data } = await axios.get(jsonUrl, {
            params: {
              timestamp: Date.now(),
            },
          });
          return { jsonUrl, exam: data };
        } catch (e) {
          return { jsonUrl, exam: false };
        }
      })
    );
    setJsons(updatedJsons);
  };

  const mergeJsons = () => {
    const additionalExams = jsons.flatMap((json) =>
      json.exam ? [json.exam] : []
    );
    if (
      !confirm(
        `${
          additionalExams.flatMap((exam) => exam.questions).length
        }問の設問を全て追加しますか？`
      )
    ) {
      return;
    }
    updateExam((exam) => {
      exam.questions = [
        ...exam.questions,
        ...additionalExams.flatMap(
          (additionalExam) => additionalExam.questions
        ),
      ];
      return exam;
    });
    setJsons([]);
  };

  const addMergeJsonUrl = (jsonUrl: string) => {
    setJsons([...jsons, { jsonUrl, exam: null }]);
  };

  const removeMergeJsonUrl = (jsonUrlIndex: number) => {
    const jsonsCopy: { jsonUrl: string; exam: UIExam | null }[] = JSON.parse(
      JSON.stringify(jsons)
    );
    jsonsCopy.splice(jsonUrlIndex, 1);
    setJsons(jsonsCopy);
  };

  useEffect(() => {
    fetchJsons();
  }, [jsons]);

  return (
    <div className="pb-32 text-gray-600">
      <Header />
      <div className="py-5 px-5">
        <div className="flex flex-col gap-5">
          <div>
            <Heading>タイトル</Heading>
            <input
              onChange={(e) =>
                updateExam((exam) => {
                  exam.meta.title = e.target.value;
                  return exam;
                })
              }
              value={exam.meta?.title}
              className="px-3 py-1 w-full mt-1"
            />
          </div>

          <div>
            <Heading>文章のタイプ</Heading>
            <select
              onChange={(e) => {
                updateExam((exam) => {
                  exam.meta.text_type = e.target.value as UITextType;
                  return exam;
                });
              }}
              value={exam.meta?.text_type ?? "plain"}
              className="px-2 py-1 mt-1"
            >
              <option>plain</option>
              <option>markdown</option>
              <option>html</option>
            </select>
          </div>

          <div>
            <Heading>概要</Heading>
            <div className="flex">
              {exam.meta?.description &&
                sentences2Elements({
                  sentences: exam.meta.description,
                  textType: exam.meta.text_type,
                  language: preferLang,
                  className: "flex-1 p-5",
                })}
              <textarea
                onChange={(e) =>
                  updateExam((exam) => {
                    exam.meta.description = e.target.value;
                    return exam;
                  })
                }
                value={exam.meta?.description}
                className="flex-1 p-5"
              ></textarea>
            </div>
          </div>

          <div>
            <Heading>作者</Heading>
            <div className="flex gap-5 mt-5">
              <div className="flex gap-3 items-center flex-1">
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
              <div className="flex-1 flex flex-col gap-5">
                <div className="flex gap-1 flex-col">
                  <p className="flex gap-2 items-center">
                    <span className="bg-main w-2 h-2" />
                    <span>作者画像URL</span>
                  </p>
                  <input
                    onChange={(e) =>
                      updateExam((exam) => {
                        exam.meta.author.icon_url = e.target.value ?? null;
                        return exam;
                      })
                    }
                    value={exam.meta?.author?.icon_url ?? ""}
                    className="w-full px-2 py-1"
                    placeholder="アイコンURL"
                  />
                </div>
                <div className="flex gap-1 flex-col">
                  <p className="flex gap-2 items-center">
                    <span className="bg-main w-2 h-2" />
                    <span>作者名</span>
                  </p>
                  <input
                    onChange={(e) =>
                      updateExam((exam) => {
                        exam.meta.author.name = e.target.value ?? null;
                        return exam;
                      })
                    }
                    value={exam.meta?.author?.name ?? ""}
                    className="w-full px-2 py-1"
                    placeholder="作成者名"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <ul className="flex flex-col gap-28 mt-10 pt-10 border-t-4">
          {exam.questions.map((question, questionIndex) => (
            <li
              key={questionIndex}
              id={`question-${questionIndex + 1}`}
              onMouseEnter={() =>
                initialized && saveMouseEnterQuestion(questionIndex)
              }
            >
              <div className="flex gap-3">
                <h2 className="text-lg font-bold">Q. {questionIndex + 1}</h2>
                <button
                  className="bg-main text-white px-2 py-0.5 rounded"
                  onClick={() => removeQuestion(questionIndex)}
                >
                  削除
                </button>
              </div>
              <h3 className="mt-7 border-b-2 font-bold text-lg">設問</h3>
              <ul className="flex gap-3 mt-3">
                {(() => {
                  const arr = (["en", "ja"] as UILanguage[]).map((lng, key) => (
                    <li className="flex-1" key={key}>
                      <textarea
                        onChange={(e) =>
                          updateExam((exam) => {
                            const question = exam.questions[questionIndex];
                            if (!question) return null;
                            question.statement[lng] = e.target.value;
                            return exam;
                          })
                        }
                        value={(() => {
                          const text =
                            exam.questions[questionIndex]?.statement[lng];
                          if (Array.isArray(text)) return text.join("\n");
                          if (typeof text === "string") return text;
                          return "";
                        })()}
                        className="p-5 w-full h-72"
                      />
                    </li>
                  ));
                  arr.splice(
                    1,
                    0,
                    <button
                      className={`text-white text-lg font-bold rounded-full w-8 h-8 self-center grid place-content-center relative ${
                        question.statement.isTranslating &&
                        'before:content-["翻訳中"] before:absolute before:-top-6 before:-left-1 before:text-sm before:text-black before:whitespace-nowrap'
                      } ${
                        shouldTranslate(question.statement)
                          ? "bg-main"
                          : "bg-slate-500 cursor-default"
                      }`}
                      onClick={() =>
                        shouldTranslate(question.statement) &&
                        translateJaEn(
                          (exam) => exam.questions[questionIndex]?.statement
                        )
                      }
                      key={2}
                    >
                      →
                    </button>
                  );
                  return arr;
                })()}
              </ul>
              <ul className="flex flex-col gap-5 mt-3">
                <h3 className="mt-7 border-b-2 font-bold text-lg">選択肢</h3>
                {question.choices.map((choice, choiceIndex) => (
                  <li key={choiceIndex} className="flex items-center gap-3">
                    <div className="flex flex-col gap-3">
                      <button
                        className={`w-7 h-7 rounded-full text-white grid place-content-center ${
                          question.corrects.includes(choiceIndex + 1)
                            ? "bg-main"
                            : "bg-black"
                        }`}
                        onClick={() =>
                          toggleCorrect(questionIndex, choiceIndex)
                        }
                      >
                        {ABC[choiceIndex]}
                      </button>
                      <button
                        className="w-7 h-7 bg-main text-white rounded-full grid place-content-center pb-1"
                        onClick={() => removeChoice(questionIndex, choiceIndex)}
                      >
                        <span>-</span>
                      </button>
                    </div>
                    <ul className="flex gap-3 flex-auto items-center">
                      {(() => {
                        const arr = (["en", "ja"] as UILanguage[]).map(
                          (lng, key) => (
                            <li className="flex-1" key={key}>
                              <button
                                onClick={() => {
                                  const choice =
                                    exam.questions[questionIndex]?.choices?.[
                                      choiceIndex
                                    ];
                                  if (!choice) return null;
                                  const nullableText = choice[lng];
                                  if (!nullableText) return;
                                  const text = Array.isArray(nullableText)
                                    ? nullableText.join("")
                                    : nullableText;
                                  choice[lng] = text.replaceAll("\n", "");
                                  return exam;
                                }}
                                className="bg-main text-white px-2 py-1 rounded"
                              >
                                one line
                              </button>
                              <textarea
                                onChange={(e) =>
                                  updateExam((exam) => {
                                    const choice =
                                      exam.questions[questionIndex]?.choices?.[
                                        choiceIndex
                                      ];
                                    if (!choice) return null;
                                    choice[lng] = e.target.value;
                                    return exam;
                                  })
                                }
                                value={(() => {
                                  const text =
                                    exam.questions[questionIndex]?.choices?.[
                                      choiceIndex
                                    ]?.[lng];
                                  if (Array.isArray(text))
                                    return text.join("\n");
                                  if (typeof text === "string") return text;
                                  return "";
                                })()}
                                className="p-5 w-full h-36"
                              />
                            </li>
                          )
                        );
                        arr.splice(
                          1,
                          0,
                          <div key={2} className="flex flex-col gap-2">
                            <button
                              className={`text-white text-lg font-bold rounded-full w-8 h-8 self-center grid place-content-center relative ${
                                choice.isTranslating &&
                                'before:content-["翻訳中"] before:absolute before:-top-6 before:-left-1 before:text-sm before:text-black before:whitespace-nowrap'
                              } ${
                                shouldTranslate(choice)
                                  ? "bg-main"
                                  : "bg-slate-500 cursor-default"
                              }`}
                              onClick={() =>
                                shouldTranslate(choice) &&
                                translateJaEn(
                                  (exam) =>
                                    exam.questions[questionIndex]?.choices[
                                      choiceIndex
                                    ]
                                )
                              }
                            >
                              →
                            </button>
                            <button
                              className={`text-white text-lg font-bold rounded-full w-8 h-8 self-center grid place-content-center relative bg-main`}
                              onClick={() => {
                                updateExam((exam) => {
                                  const choice =
                                    exam.questions[questionIndex]?.choices[
                                      choiceIndex
                                    ];
                                  if (!choice) return null;
                                  if (choice.ja) return null;
                                  if (choice.en) choice.ja = choice.en;
                                  return exam;
                                });
                              }}
                            >
                              ＝
                            </button>
                          </div>
                        );
                        return arr;
                      })()}
                    </ul>
                  </li>
                ))}
                <li>
                  <button
                    className="w-7 h-7 bg-main text-white rounded-full grid place-content-center pb-1"
                    onClick={() => addChoice(questionIndex)}
                  >
                    <span>+</span>
                  </button>
                </li>
              </ul>
              <h3 className="mt-8 border-b-2 font-bold text-lg">解説</h3>
              <ul className="flex gap-3 mt-4">
                {/* <li className="flex-1">
                  {question.explanation
                    ? sentences2Elements({
                        sentences: question.explanation,
                        textType: exam.meta?.text_type,
                        language: "ja",
                        mode: "just",
                      })
                    : "NULL"}
                </li> */}
                {(() => {
                  const arr = (["en", "ja"] as UILanguage[]).map((lng, key) => (
                    <li className="flex-1" key={key}>
                      <textarea
                        onChange={(e) => {
                          updateExam((exam) => {
                            console.log(exam);
                            const question = exam.questions[questionIndex];
                            if (!question) return null;
                            if (!question.explanation) {
                              question.explanation = {
                                ja: "",
                                en: "",
                                isTranslating: false,
                              };
                            }
                            question.explanation[lng] = e.target.value;
                            return exam;
                          });
                        }}
                        value={(() => {
                          const text =
                            exam.questions[questionIndex]?.explanation?.[lng];
                          if (Array.isArray(text)) return text.join("\n");
                          if (typeof text === "string") return text;
                          return "";
                        })()}
                        className="p-5 w-full h-72"
                      />
                    </li>
                  ));
                  arr.splice(
                    1,
                    0,
                    <button
                      className={`text-white text-lg font-bold rounded-full w-8 h-8 self-center grid place-content-center relative ${
                        question.explanation?.isTranslating &&
                        'before:content-["翻訳中"] before:absolute before:-top-6 before:-left-1 before:text-sm before:text-black before:whitespace-nowrap'
                      } ${
                        shouldTranslate(question.explanation)
                          ? "bg-main"
                          : "bg-slate-500 cursor-default"
                      }`}
                      onClick={() =>
                        shouldTranslate(question.explanation) &&
                        translateJaEn(
                          (exam) => exam.questions[questionIndex]?.explanation
                        )
                      }
                      key={2}
                    >
                      →
                    </button>
                  );
                  return arr;
                })()}
              </ul>

              <div className="mt-3">
                <button
                  className="bg-main text-white px-2 py-0.5 rounded"
                  onClick={() => addQuestion(questionIndex + 1)}
                >
                  設問を追加する
                </button>
              </div>
            </li>
          ))}
          {exam.questions.length === 0 && (
            <li className="mt-3">
              <button
                className="bg-main text-white px-2 py-0.5 rounded"
                onClick={() => addQuestion(0)}
              >
                設問を追加する
              </button>
            </li>
          )}
          <li className="mt-3">
            <table>
              <tbody>
                {jsons.map((json, jsonIndex) => (
                  <tr key={jsonIndex}>
                    <td>
                      <button
                        onClick={() => {
                          removeMergeJsonUrl(jsonIndex);
                        }}
                      >
                        -
                      </button>
                    </td>
                    <td>{json.jsonUrl}</td>
                    {json.exam && (
                      <td>{json.exam.meta?.title ?? "タイトルなし"}</td>
                    )}
                    <td>
                      {json.exam === false && "取得失敗"}
                      {json.exam === null && "取得中"}
                      {json.exam &&
                        `取得済(問題数:${json.exam.questions.length})`}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <button
                      onClick={() => {
                        addMergeJsonUrl(jsonUrl);
                        setJsonUrl("");
                      }}
                    >
                      +
                    </button>
                  </td>
                  <td>
                    <input
                      value={jsonUrl}
                      onChange={(e) => setJsonUrl(e.target.value)}
                      className="px-2 py-1"
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <button
                      className="bg-main text-white px-2 py-0.5 rounded mt-5"
                      onClick={() => mergeJsons()}
                    >
                      JSONをマージする
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </li>
        </ul>
        <FixedButtons
          buttons={[
            {
              onClick: () => setIsEditMode(false),
              text: "編集を終了",
            },
            {
              onClick: () => dumpExam(exam),
              text: "ダウンロード",
            },
            {
              onClick: () => (location.href = "/caches"),
              text: "編集中のコース一覧",
            },
          ]}
        />
      </div>
    </div>
  );
};
