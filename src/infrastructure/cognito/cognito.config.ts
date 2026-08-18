export const cognitoConfig = {
  authority: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY!,
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
  redirectUri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI!,
  responseType: process.env.NEXT_PUBLIC_COGNITO_RESPONSE_TYPE!,
  scope: process.env.NEXT_PUBLIC_COGNITO_SCOPE!,
};
