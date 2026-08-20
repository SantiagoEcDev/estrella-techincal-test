import { fetchUserAttributes } from "aws-amplify/auth";


export const getUserName = async () => {
  const attributes = await fetchUserAttributes();

  return attributes.name ?? null;
};
