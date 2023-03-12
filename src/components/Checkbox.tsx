type Props = {
  checked: boolean;
  multiple?: boolean;
  className?: string;
};

export const Checkbox = ({ checked, multiple = false, className }: Props) => {
  return (
    <div
      className={`flex-shrink-0 w-5 h-5 border-2 border-black p-1 ${
        multiple ? "" : "rounded-full"
      } ${className ?? ""}`}
    >
      {checked && (
        <div
          className={`bg-black w-full h-full ${multiple ? "" : "rounded-full"}`}
        ></div>
      )}
    </div>
  );
};
