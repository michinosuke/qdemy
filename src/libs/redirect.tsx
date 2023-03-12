export const Redirect = ({ path }: { path: string }) => {
  if (typeof window !== "undefined") {
    location.href = path;
  }
  return <></>;
};
