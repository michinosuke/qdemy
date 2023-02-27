import type { Course } from "../interfaces/course";
import type { CourseInLocalStorage } from "../interfaces/CourseInLocalStorage";
import { format } from "date-fns";

export const Caches = () => {
  const localStorages = { ...localStorage };
  console.log(localStorages);

  return (
    <table>
      <tr>
        <th>ID</th>
        <th>タイトル</th>
        <th>編集開始日時</th>
        <th>最終編集日時</th>
      </tr>
      {Object.entries(localStorages).map(([id, value]) => {
        console.log([id, value]);
        try {
          const json: CourseInLocalStorage = JSON.parse(value);
          const course: Course = JSON.parse(json.course);
          return (
            <tr>
              <td>{id}</td>
              <td>{course.meta?.title}</td>
              <td>{format(new Date(json.createdAt), "yyyy/MM/dd HH:mm:ss")}</td>
              <td>{format(new Date(json.updatedAt), "yyyy/MM/dd HH:mm:ss")}</td>
            </tr>
          );
        } catch (e) {
          if (
            confirm(
              `キャッシュの復元に失敗しました。\nローカルストレージを消去してもいいですか？`
            )
          ) {
            localStorage.clear();
          }
        }
      })}
    </table>
  );
};
