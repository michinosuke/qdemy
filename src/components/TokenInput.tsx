import { useState } from "react";
import { GET_EXAM_FUNCTION_URL } from "../libs/constants";

export const TokenInput = () => {
  const [token, setToken] = useState("");

  return (
    <div>
      <input onChange={(e) => setToken(e.target.value)} value={token} />
      <button
        onClick={() =>
          (location.href = `/exam?source=${GET_EXAM_FUNCTION_URL}?`)
        }
      >
        送信
      </button>
    </div>
  );
};
