import { useEffect, useMemo, useState } from "react";

export const Course = () => {
  console.log(typeof window);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const source = search.get("source");
    setSourceUrl(source);
  }, []);

  if (!sourceUrl) {
    return <p>パラメータ source を指定してください</p>;
  }
  return <div>{sourceUrl}</div>;
};
