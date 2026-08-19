import {
  confirmSignUp,
  fetchAuthSession,
  signIn,
  signOut,
  signUp,
} from "aws-amplify/auth";

export const register = async (
  email: string,
  password: string,
  name: string,
) => {
  return signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
        name,
      },
    },
  });
};

export const confirmRegistration = async (email: string, code: string) => {
  return confirmSignUp({
    username: email,
    confirmationCode: code,
  });
};

export const login = async (email: string, password: string) => {
  const result = await signIn({
    username: email,
    password,
  });

  const session = await fetchAuthSession();

  console.log("ACCESS TOKEN:", session.tokens?.accessToken?.toString());
  console.log("ID TOKEN:", session.tokens?.idToken?.toString());

  return result;
};

export const logout = async () => {
  return signOut();
};

export const getAccessToken = async () => {
  const session = await fetchAuthSession();

  return session.tokens?.accessToken?.toString() ?? null;
};
