import { useState } from "react";

export const useClickedQuestion = (): {
  click: (index: number) => void;
  unclick: (index: number) => void;
  isClicked: (index: number) => boolean;
  toggle: (index: number) => void;
} => {
  const [clickedQuestionIndexes, setClickedQuestionIndexes] = useState<
    Set<number>
  >(new Set());

  const click = (index: number) => {
    const indexes = new Set([...clickedQuestionIndexes]);
    indexes.add(index);
    setClickedQuestionIndexes(indexes);
  };
  const unclick = (index: number) => {
    const indexes = new Set([...clickedQuestionIndexes]);
    indexes.delete(index);
    setClickedQuestionIndexes(indexes);
  };
  const isClicked = (index: number): boolean => {
    return clickedQuestionIndexes.has(index);
  };
  const toggle = (index: number) => {
    isClicked(index) ? unclick(index) : click(index);
  };

  return {
    click,
    unclick,
    isClicked,
    toggle,
  };
};
