import dotenv from "dotenv";
import path from "node:path";
import { Pool } from "pg";

dotenv.config({
  path: path.resolve(process.cwd(), "../.env"),
});

const requiredEnvironmentVariables = [
  "RDS_HOST",
  "RDS_DATABASE",
  "RDS_USER",
  "RDS_PASSWORD",
] as const;

for (const variable of requiredEnvironmentVariables) {
  if (!process.env[variable]) {
    throw new Error(`Falta la variable de entorno ${variable}`);
  }
}

export const pool = new Pool({
  host: process.env.RDS_HOST,
  port: 5432,
  database: process.env.RDS_DATABASE,
  user: process.env.RDS_USER,
  password: process.env.RDS_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 5,
});
