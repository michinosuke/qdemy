import type { FC } from "react";

type Button = {
  className?: string | undefined;
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  text: string | null;
};

type Props = {
  buttons: Button[];
};

export const FixedButtons: FC<Props> = ({ buttons }) => {
  return (
    <ul className="fixed px-5 bottom-5 left-0 flex gap-3 z-10 whitespace-nowrap overflow-x-scroll w-full">
      {buttons.flatMap((button, key) => {
        if (!button.text) return [];
        return [
          <li
            key={key}
            className={`bg-white px-3 py-2 rounded-md shadow-lg text-gray-500 hover:text-gray-700 ${
              button.className ?? ""
            }`}
          >
            <button
              onClick={button.onClick}
              className={`${button.className} ${
                button.onClick ? "cursor-pointer" : "cursor-default"
              }`}
            >
              {button.text}
            </button>
          </li>,
        ];
      })}
    </ul>
  );
};
