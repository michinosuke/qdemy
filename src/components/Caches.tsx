import type { Exam } from "../interfaces/exam";
import type { ExamInLocalStorage } from "../interfaces/examInLocalStorage";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Header } from "./header";
import { ls } from "../libs/localStorage";

export const Caches = () => {
  const [rows, setRows] = useState<
    {
      id: string;
      exam: Exam;
      createdAt: Date;
      updatedAt: Date;
    }[]
  >([]);

  const getRows = () => {
    const localStorages = { ...localStorage };
    const rows = [];
    for (const [id, value] of Object.entries(localStorages)) {
      if (!id.startsWith("exam.")) continue;
      try {
        const json: ExamInLocalStorage = JSON.parse(value);
        const exam: Exam = JSON.parse(json.exam);
        rows.push({
          id: id.replace("exam.", ""),
          exam,
          createdAt: new Date(json.createdAt),
          updatedAt: new Date(json.updatedAt),
        });
      } catch (e: any) {
        if (
          confirm(
            `キャッシュの復元に失敗しました。\nローカルストレージを消去してもいいですか？\n${e.message}`
          )
        ) {
          localStorage.clear();
        }
        break;
      }
    }
    rows.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    setRows(rows);
  };

  useEffect(() => {
    getRows();
  }, []);

  return (
    <div>
      <Header />
      <h1 className="font-bold text-lg px-2 mt-5 text-gray-700 text-center">
        編集中のコース一覧
      </h1>
      <hr className="mt-2 border-2 border-main w-16 mx-auto" />
      <div className="w-full px-5">
        <div className="w-full overflow-x-scroll shadow-lg">
          <table className="mt-4 border-collapse border-spacing-0 w-full whitespace-nowrap">
            <thead className="bg-white text-gray-600 font-bold border-b-2 border-main">
              <tr>
                <th></th>
                <TH>ID</TH>
                <TH>タイトル</TH>
                <TH>編集開始日時</TH>
                <TH>最終編集日時</TH>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ id, exam, createdAt, updatedAt }, key) => (
                <tr
                  key={key}
                  onClick={() => (location.href = `/exam?cache=${id}`)}
                  className="bg-white border-b cursor-pointer hover:bg-[#eaf5f6] hover:shadow-md"
                >
                  <td className="px-3">
                    <button
                      className="bg-main text-white px-2 py-1 rounded-md whitespace-nowrap hover:opacity-90"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm(
                            `タイトル：${
                              exam.meta?.title ?? "未設定"
                            }\n\nこの編集中のコースを削除しますか？\nこの操作は取り消せません。`
                          )
                        ) {
                          ls.deleteExam(id);
                          getRows();
                        }
                      }}
                    >
                      削除
                    </button>
                  </td>
                  <TD>{id}</TD>
                  <TD>{exam.meta?.title}</TD>
                  <TD>{format(createdAt, "yyyy/MM/dd HH:mm:ss")}</TD>
                  <TD>{format(updatedAt, "yyyy/MM/dd HH:mm:ss")}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TH = ({ children }: any) => (
  <th className="text-center w-1/4 py-5 px-0">{children}</th>
);
const TD = ({ children }: any) => (
  <td className="text-center w-1/4 py-5 px-3">{children}</td>
);
