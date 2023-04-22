import { Children, FC, ReactNode, useState } from "react";

type Button = {
  className?: string | undefined;
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  text: string | null;
  children?: ReactNode;
};

type Props = {
  buttons: Button[];
};

export const FixedButtons: FC<Props> = ({ buttons }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-3 fixed bottom-5 right-5 items-end">
      <ul
        className={`flex flex-col gap-3 items-end ${
          isExpanded ? "menu-active" : "menu-hidden"
        }`}
      >
        {buttons.flatMap((button, key) => {
          if (!button.text) return [];
          return [
            <li
              key={key}
              className={`bg-white px-3 py-2 rounded-md shadow-lg text-gray-500 ${
                button.className ?? ""
              }`}
            >
              <button
                onClick={button.onClick}
                className={`whitespace-nowrap ${button.className} ${
                  button.onClick ? "cursor-pointer" : "cursor-default"
                }`}
              >
                {button.text}
              </button>
              {button.children}
            </li>,
          ];
        })}
      </ul>
      <div
        className="w-12 h-12 rounded-full bg-white shadow grid place-content-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-lg font-bold">+</span>
      </div>
    </div>
  );
};
