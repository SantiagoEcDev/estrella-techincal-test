import { z } from "zod";

export const loginFormSchema = z.object({
  email: z
    .string()
    .email("Correo electrónico inválido"),

  password: z
    .string()
    .min(1, "La contraseña es requerida"),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;