import type { FC } from "react";
import type { Course, Language } from "../interfaces/course";
import { ABC } from "../libs/abc";
import { dumpCourse } from "../libs/dumpCourse";
import { sentences2Elements } from "../libs/sentences2Elements";

type Props = {
  course: Course;
  updateCourse: (coursePipe: (course: Course) => Course | null) => void;
  preferLang: Language;
  initialized: boolean;
  saveMouseEnterQuestion: (questionId: string) => void;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
};

export const CourseEdit: FC<Props> = ({
  course,
  updateCourse,
  preferLang,
  initialized,
  saveMouseEnterQuestion,
  setIsEditMode,
}) => {
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
            preferLang,
          })}
        <textarea
          onChange={(e) =>
            updateCourse((course) => {
              if (course.meta?.description === undefined) return null;
              course.meta.description = e.target.value;
              return course;
            })
          }
          value={course.meta?.description}
        ></textarea>
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
            {(["ja", "en"] as Language[]).map((lng, key) => (
              <div key={key}>
                <div className="opacity-40">
                  {sentences2Elements({
                    sentences: question.question,
                    textType: course.meta?.text_type,
                    preferLang: lng,
                  })}
                </div>
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
                    const text = course.questions[questionIndex]?.question[lng];
                    if (Array.isArray(text)) return text.join("\n");
                    if (typeof text === "string") return text;
                    return "";
                  })()}
                  className="w-full h-64"
                ></textarea>
              </div>
            ))}
            <ul className="flex flex-col gap-2 mt-3">
              {question.choices.map((choice, j) => (
                <li
                  key={j}
                  className={`flex gap-5 py-2 px-3 border border-black cursor-pointer`}
                >
                  <span>{ABC[j]}</span>
                  {sentences2Elements({
                    sentences: choice,
                    textType: course.meta?.text_type,
                    preferLang,
                  })}
                </li>
              ))}
            </ul>
            {question.clicked && question.explanation && (
              <div className="mt-5 border-l-4 pl-5">
                {sentences2Elements({
                  sentences: question.explanation,
                  textType: course.meta?.text_type,
                  preferLang,
                })}
              </div>
            )}
          </li>
        ))}
      </ul>
      <ul className="fixed bottom-10 left-10 flex gap-3">
        <li>
          <button
            onClick={() => setIsEditMode(false)}
            className="bg-white px-3 py-2 rounded-md shadow-lg"
          >
            戻る
          </button>
        </li>
        <li>
          <button
            onClick={() => dumpCourse(course)}
            className="bg-white px-3 py-2 rounded-md shadow-lg"
          >
            保存
          </button>
        </li>
      </ul>
    </div>
  );
};
