import axios from "axios";
import { ls } from "./localStorage";

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(() => resolve(1), ms));

// export const translate = async (en: string): Promise<string> => {
//   await sleep(3000);
//   return "a";
// };

export type GptUsage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

export const translate = async (
  en: string
): Promise<{
  message: string;
  usage: GptUsage;
} | null> => {
  try {
    const response: {
      data: {
        message: string;
        usage: GptUsage;
      };
    } = await axios.get(
      `https://jiquxiczvsxsgxsfgcdncxhwdu0romes.lambda-url.ap-northeast-1.on.aws/`,
      {
        params: {
          prompt: en,
        },
      }
    );
    ls.addTotalTranslateToken(response.data.usage);
    return response.data;
  } catch (e: any) {
    console.log(e.message);
    return {
      message: "ERROR",
      usage: {
        completion_tokens: 0,
        prompt_tokens: 0,
        total_tokens: 0,
      },
    };
  }
};
