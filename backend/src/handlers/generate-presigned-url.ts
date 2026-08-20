import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import type {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyResultV2,
} from "aws-lambda";

const s3 = new S3Client({});

const ALLOWED_TYPES = ["video/mp4", "video/webm"] as const;
type AllowedContentType = (typeof ALLOWED_TYPES)[number];

const MAX_SIZE_BYTES = 200 * 1024 * 1024;

const isAllowedContentType = (value: unknown): value is AllowedContentType => {
  return (
    typeof value === "string" &&
    (ALLOWED_TYPES as readonly string[]).includes(value)
  );
};

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "El cuerpo de la solicitud es requerido",
        }),
      };
    }

    const body: unknown = JSON.parse(event.body);

    if (typeof body !== "object" || body === null) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Los datos de la solicitud no son válidos",
        }),
      };
    }

    const data = body as Record<string, unknown>;

    const contentType = data.contentType;
    const fileSize = data.fileSize;

    if (!isAllowedContentType(contentType)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Tipo de archivo no permitido",
        }),
      };
    }

    if (typeof fileSize !== "number" || Number.isNaN(fileSize)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "El tamaño del archivo no es válido",
        }),
      };
    }

    if (fileSize <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "El tamaño del archivo debe ser mayor que cero",
        }),
      };
    }

    if (fileSize > MAX_SIZE_BYTES) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "El archivo excede el tamaño máximo de 200 MB",
        }),
      };
    }

    const userId = event.requestContext.authorizer?.jwt?.claims?.sub;

    if (typeof userId !== "string" || !userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: "No se pudo identificar al usuario autenticado",
        }),
      };
    }

    const bucketName = process.env.VIDEOS_BUCKET;

    if (!bucketName) {
      throw new Error("VIDEOS_BUCKET no está configurado");
    }

    const extension = contentType === "video/mp4" ? "mp4" : "webm";

    const key = `credit-applications/videos/${userId}/${randomUUID()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 300,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl,
        key,
      }),
    };
  } catch (error) {
    console.error("Error generando URL de subida:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error interno",
      }),
    };
  }
};
