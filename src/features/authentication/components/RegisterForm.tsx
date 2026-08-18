"use client";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

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
            message = "La contraseña no cumple con los requisitos";
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

            {fieldState.invalid && (
              <FieldError>{fieldState.error?.message}</FieldError>
            )}
          </Field>
        )}
      />

      <span className="flex justify-center ">
        {form.formState.errors.root && (
          <FieldError>{form.formState.errors.root.message}</FieldError>
        )}
      </span>
      
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
