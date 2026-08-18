import { confirmSignUp, signIn, signOut, signUp } from "aws-amplify/auth";

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
  return signIn({
    username: email,
    password,
  });
};
export const logout = async () => {
  return signOut();
};
