import type { JaEn, Language, TextType } from "../interfaces/course";
import type { ReactElement, ReactFragment, ReactNode } from "react";

import { marked } from "marked";
import highlight from "highlight.js";
import parse from "html-react-parser";

marked.setOptions({
  highlight: (code) => {
    return highlight.highlightAuto(code).value;
  },
});

const str2Elements = ({
  str,
  textType,
  key,
}: {
  str: string;
  textType: TextType;
  key: number;
}): ReactNode => {
  switch (textType) {
    case "plain":
      return <p key={key}>{str}</p>;
    case "markdown":
      return parse(marked.parse(str)) as ReactFragment;
    case "html":
      return parse(str) as ReactFragment;
  }
};

export const sentences2Elements = ({
  sentences,
  textType = "plain",
  language,
  mode = "prefer",
  className,
  style,
}: {
  sentences: string | string[] | JaEn;
  textType: TextType | undefined;
  language: Language;
  mode?: "just" | "prefer";
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
}): ReactNode => {
  if (Array.isArray(sentences)) {
    return (
      <div className={`sentences ${className}`} style={style}>
        {sentences.map((str, key) =>
          str === "" ? <br key={key} /> : str2Elements({ str, textType, key })
        )}
      </div>
    );
  }
  if (typeof sentences === "string") {
    return (
      <div className={`sentences ${className}`} style={style}>
        {str2Elements({ str: sentences, textType, key: 1 })}
      </div>
    );
  }
  const secondLang = language === "ja" ? "en" : "ja";
  const firstSentence = sentences[language];
  const secondSentence = sentences[secondLang];

  if (firstSentence) {
    return sentences2Elements({
      sentences: firstSentence,
      textType,
      language,
      mode,
      className,
      style,
    });
  }
  if (mode === "just") return "NULL";
  if (secondSentence) {
    return sentences2Elements({
      sentences: secondSentence,
      textType,
      language,
      mode,
      className,
      style,
    });
  }
  return <></>;
};
