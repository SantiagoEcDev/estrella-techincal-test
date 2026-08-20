"use client";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useWatch, useForm } from "react-hook-form";
import { Check, Circle } from "lucide-react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { register as registerUser } from "@/lib/auth";
import { registerFormSchema } from "../schemas/registerFormSchema.schema";
import toast from "react-hot-toast";

type RegisterFormProps = {
  onSuccess: () => void;
};

const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const password = useWatch({
    control: form.control,
    name: "password",
  });

  const passwordRequirements = [
    {
      label: "Mínimo 8 caracteres",
      valid: password.length >= 8,
    },
    {
      label: "Al menos una letra mayúscula",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "Al menos una letra minúscula",
      valid: /[a-z]/.test(password),
    },
    {
      label: "Al menos un número",
      valid: /[0-9]/.test(password),
    },
    {
      label: "Al menos un carácter especial",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const onSubmit = async (data: z.infer<typeof registerFormSchema>) => {
    try {
      await registerUser(data.email, data.password, data.name);

      toast.success("Cuenta creada exitosamente. Por favor, inicia sesión.");

      onSuccess();
    } catch (error) {
      console.error(error);

      let message = "Ocurrió un error al crear la cuenta";

      if (error instanceof Error) {
        switch (error.name) {
          case "UsernameExistsException":
            message = "Ya existe una cuenta con este correo electrónico";
            break;

          case "InvalidPasswordException":
            message =
              "La contraseña no cumple con los requisitos de seguridad.";
            break;

          case "InvalidParameterException":
            message = "Los datos ingresados no son válidos";
            break;
        }
      }

      form.setError("root", {
        type: "server",
        message,
      });
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-5"
    >
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor="name">Nombre</FieldLabel>

            <Input
              {...field}
              id="name"
              type="text"
              placeholder="Ingresa tu nombre"
              autoComplete="name"
            />

            {fieldState.invalid && (
              <FieldError>{fieldState.error?.message}</FieldError>
            )}
          </Field>
        )}
      />

      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor="email">Correo Electrónico</FieldLabel>

            <Input
              {...field}
              id="email"
              type="email"
              placeholder="Ingresa tu correo electrónico"
              autoComplete="email"
            />

            {fieldState.invalid && (
              <FieldError>{fieldState.error?.message}</FieldError>
            )}
          </Field>
        )}
      />

      <Controller
        name="password"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>

            <Input
              {...field}
              id="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              autoComplete="new-password"
            />

            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                La contraseña debe cumplir con:
              </p>

              <div className="flex flex-col gap-1.5">
                {passwordRequirements.map((requirement) => (
                  <div
                    key={requirement.label}
                    className="flex items-center gap-2 text-xs"
                  >
                    {requirement.valid ? (
                      <Check className="size-3.5 text-green-600" />
                    ) : (
                      <Circle className="size-3.5 text-muted-foreground" />
                    )}

                    <span
                      className={
                        requirement.valid
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }
                    >
                      {requirement.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {fieldState.invalid && (
              <FieldError>{fieldState.error?.message}</FieldError>
            )}
          </Field>
        )}
      />

      {form.formState.errors.root && (
        <FieldError>{form.formState.errors.root.message}</FieldError>
      )}

      <Button
        type="submit"
        className="h-12 w-full"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  );
};

export default RegisterForm;
