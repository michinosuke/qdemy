import type { Language, TextType, UIJaEn } from "../interfaces/exam";
import type { FC } from "react";
import { sentences2Elements } from "../libs/sentences2Elements";
import { Checkbox } from "./Checkbox";

type Props = {
  choice: UIJaEn;
  status: "correct" | "incorrect" | "default";
  index: number;
  preferLang: Language;
  textType: TextType | undefined;
  selected: boolean;
  onClick?: React.MouseEventHandler<HTMLLIElement>;
  multiple: boolean;
};

export const Choice: FC<Props> = ({
  choice,
  status,
  preferLang,
  textType,
  selected,
  onClick,
  multiple,
}) => {
  const bgColor = (() => {
    switch (status) {
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
      onClick={onClick}
    >
      <Checkbox checked={selected} multiple={multiple} />
      {/* <span>{ABC[index]}</span> */}
      <div>
        {status === "correct" && (
          <p className="text-main font-bold -mb-3">正解</p>
        )}
        {sentences2Elements({
          sentences: choice,
          textType: textType,
          language: preferLang,
        })}
      </div>
    </li>
  );
};
