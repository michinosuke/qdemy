import { useState } from "react";
import { GET_EXAM_FUNCTION_URL } from "../libs/constants";

export const TokenInput = () => {
  const [token, setToken] = useState("");

  const validator = (token: string): boolean => {
    console.log(token);
    if (token.length !== 8) return false;
    return true;
  };

  return (
    <div className="mt-32 grid place-content-center">
      <div>
        <input
          onChange={(e) => setToken(e.target.value)}
          value={token}
          className="px-3 py-1"
        />
        <button
          onClick={() =>
            (location.href = `/exam?source=${GET_EXAM_FUNCTION_URL}?examId=${token}`)
          }
          className={`ml-5 text-white px-3 py-1 rounded ${
            validator(token) ? "bg-main" : "bg-gray-400 cursor-pointer"
          }`}
        >
          送信
        </button>
      </div>
    </div>
  );
};
