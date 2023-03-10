import axios from "axios";

export const translate = async (en: string): Promise<string> => {
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
    throw new Error();
  }
};
