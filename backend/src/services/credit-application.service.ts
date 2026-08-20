import { pool } from "../database.js";

export type CreditApplicationData = {
  fullName: string;
  identityDocument: string;
  educationalInstitution: string;
  academicProgram: string;
  requestedAmount: number;
  videoUrl?: string;
};

export const createApplication = async (
  userId: string,
  data: CreditApplicationData,
) => {
  const result = await pool.query(
    `
      INSERT INTO credit_applications (
        user_id,
        full_name,
        identity_document,
        educational_institution,
        academic_program,
        requested_amount,
        video_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    [
      userId,
      data.fullName,
      data.identityDocument,
      data.educationalInstitution,
      data.academicProgram,
      data.requestedAmount,
      data.videoUrl ?? null,
    ],
  );

  return result.rows[0];
};

export const getApplications = async (userId: string) => {
  const result = await pool.query(
    `
      SELECT *
      FROM credit_applications
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId],
  );

  return result.rows;
};

export const getApplication = async (
  id: string,
  userId: string,
) => {
  const result = await pool.query(
    `
      SELECT *
      FROM credit_applications
      WHERE id = $1
        AND user_id = $2
    `,
    [id, userId],
  );

  return result.rows[0] ?? null;
};

export const updateApplication = async (
  id: string,
  userId: string,
  data: CreditApplicationData,
) => {
  const result = await pool.query(
    `
      UPDATE credit_applications
      SET
        full_name = $1,
        identity_document = $2,
        educational_institution = $3,
        academic_program = $4,
        requested_amount = $5,
        video_url = $6,
        updated_at = NOW()
      WHERE id = $7
        AND user_id = $8
      RETURNING *
    `,
    [
      data.fullName,
      data.identityDocument,
      data.educationalInstitution,
      data.academicProgram,
      data.requestedAmount,
      data.videoUrl ?? null,
      id,
      userId,
    ],
  );

  return result.rows[0] ?? null;
};

export const deleteApplication = async (
  id: string,
  userId: string,
) => {
  const result = await pool.query(
    `
      DELETE FROM credit_applications
      WHERE id = $1
        AND user_id = $2
      RETURNING id
    `,
    [id, userId],
  );

  return result.rows[0] ?? null;
};