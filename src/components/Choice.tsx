import type { JaEn, Language, TextType } from "../interfaces/course";

import { ABC } from "../libs/abc";
import type { FC } from "react";
import { sentences2Elements } from "../libs/sentences2Elements";
import { Checkbox } from "./Checkbox";

type Props = {
  choice: JaEn;
  color: "correct" | "incorrect" | "default";
  index: number;
  preferLang: Language;
  textType: TextType | undefined;
  selected: boolean;
  onClick?: React.MouseEventHandler<HTMLLIElement>;
  multiple: boolean;
};

export const Choice: FC<Props> = ({
  choice,
  color,
  index,
  preferLang,
  textType,
  selected,
  onClick,
  multiple,
}) => {
  const bgColor = (() => {
    switch (color) {
      case "correct":
        return "bg-[#e1f5f7]";
      case "incorrect":
        return "";
      default:
        return "";
    }
  })();
  return (
    <li
      className={`flex gap-5 items-center py-3 border pl-3 pr-5 cursor-pointer rounded hover:shadow-[#e1f5f7] ${bgColor} ${
        selected ? "shadow-inner" : "shadow-lg"
      }`}
      // className={`flex gap-5 py-2 px-3 border border-black cursor-pointer ${
      //   question.corrects.includes(j + 1) && question.clicked ? "bg-blue-100" : ""
      // } ${
      //   !question.corrects.includes(j + 1) && question.clicked ? "bg-red-100" : ""
      // }`}
      onClick={onClick}
    >
      <Checkbox checked={selected} multiple={multiple} />
      {/* <span>{ABC[index]}</span> */}
      {sentences2Elements({
        sentences: choice,
        textType: textType,
        language: preferLang,
      })}
    </li>
  );
};
