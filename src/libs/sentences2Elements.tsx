import { marked } from "marked";
import type { ReactElement, ReactFragment, ReactNode } from "react";
import type { JaEn, Language, TextType } from "../interfaces/course";
import parse from "html-react-parser";

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
  preferLang,
  className,
}: {
  sentences: string | string[] | JaEn;
  textType: TextType | undefined;
  preferLang: Language;
  className?: string;
}): ReactNode => {
  console.log({ className });
  if (Array.isArray(sentences)) {
    return (
      <div className={`sentences ${className}`}>
        {sentences.map((str, key) =>
          str === "" ? <br key={key} /> : str2Elements({ str, textType, key })
        )}
      </div>
    );
  }
  if (typeof sentences === "string") {
    return (
      <div className={`sentences ${className}`}>
        {str2Elements({ str: sentences, textType, key: 1 })}
      </div>
    );
  }
  const firstLang = preferLang;
  const secondLang = preferLang === "ja" ? "en" : "ja";
  const firstSentence = sentences[firstLang];
  const secondSentence = sentences[secondLang];

  if (firstSentence) {
    return sentences2Elements({
      sentences: firstSentence,
      textType,
      preferLang,
    });
  }
  if (secondSentence) {
    return sentences2Elements({
      sentences: secondSentence,
      textType,
      preferLang,
    });
  }
  return <></>;
};
