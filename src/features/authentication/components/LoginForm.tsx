"use client";

import { useState } from "react";
import z from "zod";
import { Eye, EyeOff } from "lucide-react";
import { loginFormSchema } from "../schemas/loginFormSchema.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/auth";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const router = useRouter();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof loginFormSchema>) => {
    try {
      await login(data.email, data.password);

      router.push("/dashboard");
    } catch (error) {
      console.error(error);

      let message = "Ocurrió un error al iniciar sesión";

      if (error instanceof Error && error.name === "NotAuthorizedException") {
        message = "Correo o contraseña incorrectos";
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
      className="flex w-full flex-col gap-6"
    >
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

            <div className="relative">
              <Input
                {...field}
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setIsPasswordVisible((current) => !current)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={
                  isPasswordVisible
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
                tabIndex={-1}
              >
                {isPasswordVisible ? (
                  <EyeOff className="size-4 cursor-pointer text-primary" />
                ) : (
                  <Eye className="size-4 cursor-pointer text-primary" />
                )}
              </button>
            </div>

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
        className="h-10 w-full"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
      </Button>
    </form>
  );
};

export default LoginForm;
