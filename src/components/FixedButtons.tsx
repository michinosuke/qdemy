import type { FC } from "react";

type Button = {
  className?: string | undefined;
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  text: string;
};

type Props = {
  buttons: Button[];
};

export const FixedButtons: FC<Props> = ({ buttons }) => (
  <ul className="fixed px-5 bottom-10 left-0 flex gap-3 z-10 whitespace-nowrap overflow-x-scroll w-full">
    {buttons.map((button, key) => (
      <li
        key={key}
        className={`bg-white px-3 py-2 rounded-md shadow-lg ${
          button.className ?? ""
        }`}
      >
        <button onClick={button.onClick} className={button.className}>
          {button.text}
        </button>
      </li>
    ))}
  </ul>
);
