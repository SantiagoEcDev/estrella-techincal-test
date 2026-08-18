"use client";

import { AuthProvider } from "react-oidc-context";
import { cognitoConfig } from "@/infrastructure/cognito/cognito.config";

type AuthProviderProps = {
  children: React.ReactNode;
};

export const CognitoProvider = ({ children }: AuthProviderProps) => {
  return (
    <AuthProvider
      authority={cognitoConfig.authority}
      client_id={cognitoConfig.clientId}
      redirect_uri={cognitoConfig.redirectUri}
      response_type={cognitoConfig.responseType}
      scope={cognitoConfig.scope}
    >
      {children}
    </AuthProvider>
  );
};
