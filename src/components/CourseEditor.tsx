import type { Course, JaEn, Language, TextType } from "../interfaces/course";

import { ABC } from "../libs/abc";
import type { FC } from "react";
import { dumpCourse } from "../libs/dumpCourse";
import { sentences2Elements } from "../libs/sentences2Elements";
import { Header } from "./header";
import { Heading } from "./Heading";

type Props = {
  course: Course;
  updateCourse: (coursePipe: (course: Course) => Course | null) => void;
  preferLang: Language;
  initialized: boolean;
  saveMouseEnterQuestion: (questionId: string) => void;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  translateJaEn: (
    jaEnCallback: (course: Course) => JaEn | undefined
  ) => Promise<boolean>;
};

export const CourseEdit: FC<Props> = ({
  course,
  updateCourse,
  preferLang,
  initialized,
  saveMouseEnterQuestion,
  setIsEditMode,
  translateJaEn,
}) => {
  return (
    <div className="pb-32">
      <Header />
      <div className="py-5 px-5">
        <div className="flex flex-col gap-5">
          <div>
            <Heading>タイトル</Heading>
            <input
              onChange={(e) =>
                updateCourse((course) => {
                  if (!course.meta) course.meta = {};
                  course.meta.title = e.target.value;
                  return course;
                })
              }
              value={course.meta?.title}
              className="px-3 py-1 w-full mt-1"
            />
          </div>

          <div>
            <Heading>文章のタイプ</Heading>
            <select
              onChange={(e) => {
                updateCourse((course) => {
                  if (!course.meta) course.meta = {};
                  course.meta.text_type = e.target.value as TextType;
                  return course;
                });
              }}
              value={course.meta?.text_type ?? "plain"}
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
              {course.meta?.description &&
                sentences2Elements({
                  sentences: course.meta.description,
                  textType: course.meta.text_type,
                  language: preferLang,
                  className: "flex-1 p-5",
                })}
              <textarea
                onChange={(e) =>
                  updateCourse((course) => {
                    if (!course.meta) course.meta = {};
                    course.meta.description = e.target.value;
                    return course;
                  })
                }
                value={course.meta?.description}
                className="flex-1 p-5"
              ></textarea>
            </div>
          </div>

          <div>
            <Heading>作者</Heading>
            <div className="flex gap-5 mt-5">
              <div className="flex gap-3 items-center flex-1">
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
              <div className="flex-1 flex flex-col gap-5">
                <div className="flex gap-1 flex-col">
                  <p className="flex gap-2 items-center">
                    <span className="bg-main w-2 h-2" />
                    <span>作者画像URL</span>
                  </p>
                  <input
                    onChange={(e) =>
                      updateCourse((course) => {
                        if (!course.meta) course.meta = {};
                        if (!course.meta.author) course.meta.author = {};
                        course.meta.author.icon_url = e.target.value ?? null;
                        return course;
                      })
                    }
                    value={course.meta?.author?.icon_url ?? ""}
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
                      updateCourse((course) => {
                        if (!course.meta) course.meta = {};
                        if (!course.meta.author) course.meta.author = {};
                        course.meta.author.name = e.target.value ?? null;
                        return course;
                      })
                    }
                    value={course.meta?.author?.name ?? ""}
                    className="w-full px-2 py-1"
                    placeholder="作成者名"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <ul className="flex flex-col gap-28 mt-10 pt-10 border-t-4">
          {course.questions.map((question, questionIndex) => (
            <li
              key={questionIndex}
              id={`question-${questionIndex + 1}`}
              onMouseEnter={() =>
                initialized &&
                saveMouseEnterQuestion(`question-${questionIndex + 1}`)
              }
            >
              <h2 className="text-lg font-bold">Q. {questionIndex + 1}</h2>
              <h3 className="mt-7 border-b-2 font-bold text-lg">設問</h3>
              <ul className="flex gap-3 mt-3">
                {(() => {
                  const arr = (["en", "ja"] as Language[]).map((lng, key) => (
                    <li className="flex-1" key={key}>
                      <textarea
                        onChange={(e) =>
                          updateCourse((course) => {
                            const question = course.questions[questionIndex];
                            if (!question) return null;
                            question.question[lng] = e.target.value;
                            return course;
                          })
                        }
                        value={(() => {
                          const text =
                            course.questions[questionIndex]?.question[lng];
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
                        question.question.isTranslating &&
                        'before:content-["翻訳中"] before:absolute before:-top-6 before:-left-1 before:text-sm before:text-black before:whitespace-nowrap'
                      } ${
                        !question.question.isTranslating &&
                        question.question.en &&
                        !question.question.ja
                          ? "bg-main"
                          : "bg-black"
                      }`}
                      onClick={() =>
                        !question.question.isTranslating &&
                        translateJaEn(
                          (course) => course.questions[questionIndex]?.question
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
                    <h3
                      className={`w-7 h-7 rounded-full text-white grid place-content-center ${
                        question.corrects.includes(choiceIndex + 1)
                          ? "bg-main"
                          : "bg-black"
                      }`}
                    >
                      <span>{ABC[choiceIndex]}</span>
                    </h3>
                    <ul className="flex gap-3 flex-auto">
                      {(() => {
                        const arr = (["en", "ja"] as Language[]).map(
                          (lng, key) => (
                            <li className="flex-1" key={key}>
                              <textarea
                                onChange={(e) =>
                                  updateCourse((course) => {
                                    const choice =
                                      course.questions[questionIndex]
                                        ?.choices?.[choiceIndex];
                                    if (!choice) return null;
                                    choice[lng] = e.target.value;
                                    return course;
                                  })
                                }
                                value={(() => {
                                  const text =
                                    course.questions[questionIndex]?.choices?.[
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
                          <button
                            className={`text-white text-lg font-bold rounded-full w-8 h-8 self-center grid place-content-center relative ${
                              choice.isTranslating &&
                              'before:content-["翻訳中"] before:absolute before:-top-6 before:-left-1 before:text-sm before:text-black before:whitespace-nowrap'
                            } ${
                              !choice.isTranslating && choice.en && !choice.ja
                                ? "bg-main"
                                : "bg-black"
                            }`}
                            onClick={() =>
                              !choice.isTranslating &&
                              translateJaEn(
                                (course) =>
                                  course.questions[questionIndex]?.choices[
                                    choiceIndex
                                  ]
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
                  </li>
                ))}
              </ul>
              <h3 className="mt-8 border-b-2 font-bold text-lg">解説</h3>
              <ul className="flex gap-3 mt-4">
                {/* <li className="flex-1">
                  {question.explanation
                    ? sentences2Elements({
                        sentences: question.explanation,
                        textType: course.meta?.text_type,
                        language: "ja",
                        mode: "just",
                      })
                    : "NULL"}
                </li> */}
                {(() => {
                  const arr = (["en", "ja"] as Language[]).map((lng, key) => (
                    <li className="flex-1" key={key}>
                      <textarea
                        onChange={(e) =>
                          updateCourse((course) => {
                            const explanation =
                              course.questions[questionIndex]?.explanation;
                            if (!explanation) return null;
                            explanation[lng] = e.target.value;
                            return course;
                          })
                        }
                        value={(() => {
                          const text =
                            course.questions[questionIndex]?.explanation?.[lng];
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
                        !question.explanation?.isTranslating &&
                        question.explanation?.en &&
                        !question.explanation?.ja
                          ? "bg-main"
                          : "bg-black"
                      }`}
                      onClick={() =>
                        !question.explanation?.isTranslating &&
                        translateJaEn(
                          (course) =>
                            course.questions[questionIndex]?.explanation
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
            </li>
          ))}
        </ul>
        <ul className="fixed bottom-10 left-10 flex gap-3">
          <li>
            <button
              onClick={() => setIsEditMode(false)}
              className="bg-white px-3 py-2 rounded-md shadow-lg"
            >
              編集を終了
            </button>
          </li>
          <li>
            <button
              onClick={() => dumpCourse(course)}
              className="bg-white px-3 py-2 rounded-md shadow-lg"
            >
              ダウンロード
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
        </ul>
      </div>
    </div>
  );
};
