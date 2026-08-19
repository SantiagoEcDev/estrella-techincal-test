import z from "zod";

const MAX_VIDEO_SIZE = 200 * 1024 * 1024;

export const creditApplicationFormSchema = z.object({
  identityDocument: z.string().min(1, "El documento de identidad es requerido"),

  educationalInstitution: z
    .string()
    .min(1, "La institución educativa es requerida"),

  academicProgram: z.string().min(1, "El programa académico es requerido"),

  requestedAmount: z
    .number()
    .positive("El monto solicitado debe ser mayor a 0"),

  video: z
    .instanceof(File, {
      message: "El video es requerido",
    })
    .refine(
      (file) => file.size <= MAX_VIDEO_SIZE,
      "El video no puede superar los 200 MB",
    )
    .refine(
      (file) => ["video/mp4", "video/webm"].includes(file.type),
      "El video debe estar en formato MP4 o WebM",
    ),
});
