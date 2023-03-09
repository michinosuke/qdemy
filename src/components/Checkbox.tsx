type Props = {
  checked: boolean;
};

export const Checkbox = ({ checked }: Props) => {
  return (
    <div className="flex-shrink-0 w-5 h-5 border-2 border-black p-1 rounded-full">
      {checked && <div className="bg-black w-full h-full rounded-full"></div>}
    </div>
  );
};
