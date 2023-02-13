import type { FC } from "react";
import type { JaEn, Language, TextType } from "../interfaces/course";
import { ABC } from "../libs/abc";
import { sentences2Elements } from "../libs/sentences2Elements";

type Props = {
  choice: JaEn;
  color: "correct" | "incorrect" | "default";
  index: number;
  preferLang: Language;
  textType: TextType | undefined;
  onClick?: React.MouseEventHandler<HTMLLIElement>;
};

export const Choice: FC<Props> = ({
  choice,
  color,
  index,
  preferLang,
  textType,
  onClick,
}) => {
  const bgColor = (() => {
    switch (color) {
      case "correct":
        return "bg-blue-100";
      case "incorrect":
        return "bg-red-100";
      default:
        return "";
    }
  })();
  return (
    <li
      className={`flex gap-5 py-5 border px-3 cursor-pointer shadow-lg rounded ${bgColor}`}
      // className={`flex gap-5 py-2 px-3 border border-black cursor-pointer ${
      //   question.corrects.includes(j + 1) && question.clicked ? "bg-blue-100" : ""
      // } ${
      //   !question.corrects.includes(j + 1) && question.clicked ? "bg-red-100" : ""
      // }`}
      onClick={onClick}
    >
      <span>{ABC[index]}</span>
      {sentences2Elements({
        sentences: choice,
        textType: textType,
        language: preferLang,
      })}
    </li>
  );
};
