"use client";

import { Amplify } from "aws-amplify";
import { cognitoConfig } from "@/infrastructure/cognito/cognito.config";

Amplify.configure(cognitoConfig, {
  ssr: true,
});
