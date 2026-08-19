import z from "zod";

export const creditApplicationFormSchema = z.object({
  identityDocument: z.string().min(1, "El documento de identidad es requerido"),

  educationalInstitution: z
    .string()
    .min(1, "La institución educativa es requerida"),

  academicProgram: z.string().min(1, "El programa académico es requerido"),

  requestedAmount: z
    .number()
    .positive("El monto solicitado debe ser mayor a 0"),

  videoUrl: z.url("Ingresa una URL válida").optional().or(z.literal("")),
});
