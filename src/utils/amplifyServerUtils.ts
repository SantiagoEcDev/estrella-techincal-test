import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import { cognitoConfig } from "@/infrastructure/cognito/cognito.config";

export const { runWithAmplifyServerContext } = createServerRunner({
  config: cognitoConfig,
});
