import { useState } from "react";
import { Heading } from "./Heading";
import { ls } from "../libs/localStorage";

export const CreateExamForm = () => {
  const [title, setTitle] = useState("");
  return (
    <div className="py-3 px-5 border">
      <Heading>模擬試験を新規作成する</Heading>
      <div className="mt-3 flex gap-3">
        <span className="flex-shrink-0">タイトル: </span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-2 py-0.5 border w-full"
        />
      </div>
      <button
        onClick={() => {
          if (!title) return;
          window.location.href = `/exam?cache=${ls.saveExam({
            meta: {
              title,
              text_type: "markdown",
            },
            questions: [
              {
                statement: {
                  ja: "生命、宇宙、そして万物についての究極の疑問の答え",
                },
                choices: [
                  {
                    ja: "55",
                  },
                  {
                    ja: "42",
                  },
                  {
                    ja: "78",
                  },
                ],
                explanation: {
                  ja: [
                    "ダグラス・アダムズの『銀河ヒッチハイク・ガイド』は、イギリスのラジオドラマで、のちに小説化、テレビドラマ化、そしてついに映画化がなされた人気シリーズ。",
                    "作中、「生命、宇宙、そして万物についての究極の疑問の答え」を問われたスーパーコンピュータ、ディープ・ソートが750万年の計算の末に出した答えが、「42」です。",
                    "[Wikipedia - 生命、宇宙、そして万物についての究極の疑問の答え](https://ja.wikipedia.org/wiki/%E7%94%9F%E5%91%BD%E3%80%81%E5%AE%87%E5%AE%99%E3%80%81%E3%81%9D%E3%81%97%E3%81%A6%E4%B8%87%E7%89%A9%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6%E3%81%AE%E7%A9%B6%E6%A5%B5%E3%81%AE%E7%96%91%E5%95%8F%E3%81%AE%E7%AD%94%E3%81%88)",
                  ],
                },
                corrects: [2],
                selects: [],
              },
            ],
          })}`;
        }}
        className={`text-white px-2 py-1 mt-3 rounded ${
          title ? "bg-main" : "bg-slate-500 cursor-default"
        }`}
      >
        新規作成
      </button>
    </div>
  );
};
