import { z } from "zod";

export const registerFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),

  email: z.string().email("Ingresa un correo electrónico válido"),

  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .refine(
      (password) =>
        [...password].some((character) => character >= "0" && character <= "9"),
      "La contraseña debe contener al menos un número",
    )
    .refine(
      (password) =>
        [...password].some((character) => character >= "A" && character <= "Z"),
      "La contraseña debe contener al menos una letra mayúscula",
    )
    .refine(
      (password) =>
        [...password].some((character) => character >= "a" && character <= "z"),
      "La contraseña debe contener al menos una letra minúscula",
    ),
});

export type RegisterFormData = z.infer<typeof registerFormSchema>;
