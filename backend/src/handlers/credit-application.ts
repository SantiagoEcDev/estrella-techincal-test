import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { pool } from "../database.js";

type CreditApplicationBody = {
  fullName: string;
  identityDocument: string;
  educationalInstitution: string;
  academicProgram: string;
  requestedAmount: number;
  videoUrl?: string;
};

type JwtClaims = {
  sub?: string;
};

type RequestContextWithAuthorizer = {
  authorizer?: {
    jwt?: {
      claims?: JwtClaims;
    };
  };
};

const response = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(body)
});

const getUserId = (
  event: Parameters<APIGatewayProxyHandlerV2>[0]
): string | null => {
  const context =
    event.requestContext as Parameters<
      APIGatewayProxyHandlerV2
    >[0]["requestContext"] &
      RequestContextWithAuthorizer;

  const sub = context.authorizer?.jwt?.claims?.sub;

  return typeof sub === "string" ? sub : null;
};

const parseBody = (
  body: string | undefined
): CreditApplicationBody | null => {
  if (!body) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(body);

    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const data = parsed as Record<string, unknown>;

    if (
      typeof data.fullName !== "string" ||
      typeof data.identityDocument !== "string" ||
      typeof data.educationalInstitution !== "string" ||
      typeof data.academicProgram !== "string" ||
      typeof data.requestedAmount !== "number"
    ) {
      return null;
    }

    if (
      data.videoUrl !== undefined &&
      typeof data.videoUrl !== "string"
    ) {
      return null;
    }

    return {
      fullName: data.fullName,
      identityDocument: data.identityDocument,
      educationalInstitution: data.educationalInstitution,
      academicProgram: data.academicProgram,
      requestedAmount: data.requestedAmount,
      videoUrl: data.videoUrl
    };
  } catch {
    return null;
  }
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  
  const method = event.requestContext.http.method;
  const userId = getUserId(event);

  if (!userId) {
    return response(401, {
      message: "No se pudo identificar al usuario autenticado"
    });
  }

  try {
    if (method === "POST") {
      const body = parseBody(event.body);

      if (!body) {
        return response(400, {
          message: "Los datos de la solicitud no son válidos"
        });
      }

      if (body.requestedAmount <= 0) {
        return response(400, {
          message: "El monto solicitado debe ser mayor que cero"
        });
      }

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
          body.fullName,
          body.identityDocument,
          body.educationalInstitution,
          body.academicProgram,
          body.requestedAmount,
          body.videoUrl ?? null
        ]
      );

      return response(201, {
        message: "Solicitud de crédito creada correctamente",
        data: result.rows[0]
      });
    }

    if (method === "GET" && !event.pathParameters?.id) {
      const result = await pool.query(
        `
          SELECT *
          FROM credit_applications
          WHERE user_id = $1
          ORDER BY created_at DESC
        `,
        [userId]
      );

      return response(200, {
        data: result.rows
      });
    }

    if (method === "GET" && event.pathParameters?.id) {
      const result = await pool.query(
        `
          SELECT *
          FROM credit_applications
          WHERE id = $1
            AND user_id = $2
        `,
        [
          event.pathParameters.id,
          userId
        ]
      );

      if (result.rowCount === 0) {
        return response(404, {
          message: "Solicitud de crédito no encontrada"
        });
      }

      return response(200, {
        data: result.rows[0]
      });
    }

    if (method === "PUT" && event.pathParameters?.id) {
      const body = parseBody(event.body);

      if (!body) {
        return response(400, {
          message: "Los datos de la solicitud no son válidos"
        });
      }

      if (body.requestedAmount <= 0) {
        return response(400, {
          message: "El monto solicitado debe ser mayor que cero"
        });
      }

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
          body.fullName,
          body.identityDocument,
          body.educationalInstitution,
          body.academicProgram,
          body.requestedAmount,
          body.videoUrl ?? null,
          event.pathParameters.id,
          userId
        ]
      );

      if (result.rowCount === 0) {
        return response(404, {
          message: "Solicitud de crédito no encontrada"
        });
      }

      return response(200, {
        message: "Solicitud de crédito actualizada correctamente",
        data: result.rows[0]
      });
    }

    if (method === "DELETE" && event.pathParameters?.id) {
      const result = await pool.query(
        `
          DELETE FROM credit_applications
          WHERE id = $1
            AND user_id = $2
          RETURNING id
        `,
        [
          event.pathParameters.id,
          userId
        ]
      );

      if (result.rowCount === 0) {
        return response(404, {
          message: "Solicitud de crédito no encontrada"
        });
      }

      return response(200, {
        message: "Solicitud de crédito eliminada correctamente"
      });
    }

    return response(405, {
      message: "Método no permitido"
    });
  } catch (error) {
    console.error(error);

    return response(500, {
      message: "Ocurrió un error al procesar la solicitud de crédito"
    });
  }
};
