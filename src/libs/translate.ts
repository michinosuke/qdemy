import axios from "axios";

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(() => resolve(1), ms));

// export const translate = async (en: string): Promise<string> => {
//   await sleep(3000);
//   return "a";
// };

export const translate = async (en: string): Promise<string | null> => {
  try {
    const response = await axios.get(
      `https://jiquxiczvsxsgxsfgcdncxhwdu0romes.lambda-url.ap-northeast-1.on.aws/`,
      {
        params: {
          prompt: en,
        },
      }
    );
    return response.data;
  } catch (e: any) {
    console.log(e.message);
    return "ERROR";
  }
};
