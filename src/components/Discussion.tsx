import type { FC } from "react";
import type {
  UIDiscussion as D,
  UILanguage,
  UITextType,
} from "../interfaces/uiExam";
import { sentences2Elements } from "../libs/sentences2Elements";

type Props = {
  discussions: D[];
  preferLang: UILanguage;
  textType: UITextType;
  bgColorReverse?: boolean;
};

export const Discussions: FC<Props> = ({
  discussions,
  preferLang,
  textType,
  bgColorReverse = false,
}) => (
  <ul>
    {discussions
      .sort((a, b) => b.upvote_count - a.upvote_count)
      .map((discussion) => (
        <li
          className={`rounded-md mt-3 px-3 pt-3 pb-3 border-l-4 border-main ${
            bgColorReverse ? "bg-[hsl(180,50%,96%)]" : "bg-white"
          }`}
        >
          {discussion.guessed_choices.length > 0 && (
            <p>
              正解だと思う選択肢:{" "}
              <span className="bg-main rounded-md px-2 py-1 text-white">
                {discussion.guessed_choices}
              </span>
            </p>
          )}
          <p>
            {sentences2Elements({
              language: preferLang,
              sentences: discussion.comment,
              textType,
              mode: "prefer",
            })}
          </p>
          {discussion.upvote_count > 0 && (
            <span>👍 {discussion.upvote_count}</span>
          )}
          {discussion.replies.length > 0 && (
            <div className="pl-5">
              <Discussions
                {...{
                  discussions: discussion.replies,
                  preferLang,
                  textType,
                  bgColorReverse: !bgColorReverse,
                }}
              />
            </div>
          )}
        </li>
      ))}
  </ul>
);
