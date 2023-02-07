export const parseJSON = (
  jsonString: string
):
  | {
      json: null;
      error: string;
    }
  | { json: object; error: null } => {
  try {
    return { json: JSON.parse(jsonString), error: null };
  } catch (error: any) {
    return { json: null, error: error.message };
  }
};
