import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  createApplication,
  deleteApplication,
  getApplication,
  getApplications,
  updateApplication,
  type CreditApplicationData,
} from "../services/credit-application.service.js";
import { response } from "../utils/http.js";

type RequestContextWithAuthorizer = {
  authorizer?: {
    jwt?: {
      claims?: {
        sub?: string;
      };
    };
  };
};

const getUserId = (
  event: Parameters<APIGatewayProxyHandlerV2>[0],
): string | null => {
  const context = event.requestContext as typeof event.requestContext &
    RequestContextWithAuthorizer;

  const userId = context.authorizer?.jwt?.claims?.sub;

  return typeof userId === "string" ? userId : null;
};
const parseBody = (body: string | undefined): CreditApplicationData | null => {
  if (!body) return null;

  try {
    const data = JSON.parse(body);

    if (
      typeof data.fullName !== "string" ||
      typeof data.identityDocument !== "string" ||
      typeof data.educationalInstitution !== "string" ||
      typeof data.academicProgram !== "string" ||
      typeof data.requestedAmount !== "number"
    ) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const userId = getUserId(event);
  const method = event.requestContext.http.method;
  const id = event.pathParameters?.id;

  if (!userId) {
    return response(401, {
      message: "No se pudo identificar al usuario autenticado",
    });
  }

  try {
    if (method === "POST") {
      const data = parseBody(event.body);

      if (!data || data.requestedAmount <= 0) {
        return response(400, {
          message: "Los datos de la solicitud no son válidos",
        });
      }

      const application = await createApplication(userId, data);

      return response(201, {
        message: "Solicitud de crédito creada correctamente",
        data: application,
      });
    }

    if (method === "GET" && !id) {
      const applications = await getApplications(userId);

      return response(200, {
        data: applications,
      });
    }

    if (method === "GET" && id) {
      const application = await getApplication(id, userId);

      if (!application) {
        return response(404, {
          message: "Solicitud de crédito no encontrada",
        });
      }

      return response(200, {
        data: application,
      });
    }

    if (method === "PUT" && id) {
      const data = parseBody(event.body);

      if (!data || data.requestedAmount <= 0) {
        return response(400, {
          message: "Los datos de la solicitud no son válidos",
        });
      }

      const application = await updateApplication(id, userId, data);

      if (!application) {
        return response(404, {
          message: "Solicitud de crédito no encontrada",
        });
      }

      return response(200, {
        message: "Solicitud de crédito actualizada correctamente",
        data: application,
      });
    }

    if (method === "DELETE" && id) {
      const application = await deleteApplication(id, userId);

      if (!application) {
        return response(404, {
          message: "Solicitud de crédito no encontrada",
        });
      }

      return response(200, {
        message: "Solicitud de crédito eliminada correctamente",
      });
    }

    return response(405, {
      message: "Método no permitido",
    });
  } catch (error) {
    console.error(error);

    return response(500, {
      message: "Ocurrió un error al procesar la solicitud de crédito",
    });
  }
};
