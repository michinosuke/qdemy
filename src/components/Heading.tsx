export const Heading = ({ children }: { children: string }) => (
  <p className="font-bold text-lg px-2 flex items-center gap-2">
    <span className="w-3 h-3 rounded-full bg-main inline-block" />
    <span>{children}</span>
  </p>
);
