"use client";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { fetchAuthSession } from "aws-amplify/auth";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createCreditApplication,
  updateCreditApplication,
} from "../services/creditApplication.service";
import toast from "react-hot-toast";
import { creditApplicationFormSchema } from "../schemas/creditApplication.schema";
import type { CreditApplication } from "../types/creditApplication.types";

type CreditApplicationFormProps = {
  application?: CreditApplication;
  onSuccess?: () => void;
};

const CreditApplicationForm = ({
  application,
  onSuccess,
}: CreditApplicationFormProps) => {
  const isEditing = Boolean(application);

  const form = useForm<z.infer<typeof creditApplicationFormSchema>>({
    resolver: zodResolver(creditApplicationFormSchema),
    defaultValues: {
      identityDocument: application?.identityDocument ?? "",
      educationalInstitution: application?.educationalInstitution ?? "",
      academicProgram: application?.academicProgram ?? "",
      requestedAmount: application?.requestedAmount ?? 0,
      videoUrl: application?.videoUrl ?? "",
    },
  });

  const onSubmit = async (
    data: z.infer<typeof creditApplicationFormSchema>,
  ) => {
    try {
      if (application) {
        await updateCreditApplication(application.id, data);

        toast.success("Solicitud actualizada exitosamente");
      } else {
        const session = await fetchAuthSession();

        const fullName = session.tokens?.idToken?.payload?.name;

        if (typeof fullName !== "string" || !fullName) {
          form.setError("root", {
            type: "server",
            message:
              "No se pudo obtener el nombre del usuario autenticado",
          });

          return;
        }

        await createCreditApplication({
          ...data,
          fullName,
        });

        toast.success("Solicitud creada exitosamente");
      }

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error(error);

      form.setError("root", {
        type: "server",
        message: isEditing
          ? "No fue posible actualizar la solicitud"
          : "No fue posible crear la solicitud",
      });
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-5"
    >
      <Controller
        name="identityDocument"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor="identityDocument">
              Documento de identidad
            </FieldLabel>

            <Input
              {...field}
              id="identityDocument"
              type="text"
              placeholder="Ingresa tu documento de identidad"
              autoComplete="off"
            />

            {fieldState.invalid && (
              <FieldError>{fieldState.error?.message}</FieldError>
            )}
          </Field>
        )}
      />

      <Controller
        name="educationalInstitution"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor="educationalInstitution">
              Institución educativa
            </FieldLabel>

            <Input
              {...field}
              id="educationalInstitution"
              type="text"
              placeholder="Ingresa tu institución educativa"
              autoComplete="organization"
            />

            {fieldState.invalid && (
              <FieldError>{fieldState.error?.message}</FieldError>
            )}
          </Field>
        )}
      />

      <Controller
        name="academicProgram"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor="academicProgram">
              Programa académico
            </FieldLabel>

            <Input
              {...field}
              id="academicProgram"
              type="text"
              placeholder="Ingresa tu programa académico"
            />

            {fieldState.invalid && (
              <FieldError>{fieldState.error?.message}</FieldError>
            )}
          </Field>
        )}
      />

      <Controller
        name="requestedAmount"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor="requestedAmount">
              Monto solicitado
            </FieldLabel>

            <Input
              id="requestedAmount"
              type="text"
              inputMode="numeric"
              placeholder="Ingresa el monto solicitado"
              value={
                field.value
                  ? field.value.toLocaleString("es-CO")
                  : ""
              }
              onChange={(event) => {
                const rawValue = event.target.value.replace(/\D/g, "");

                field.onChange(
                  rawValue === "" ? 0 : Number(rawValue),
                );
              }}
            />

            {fieldState.invalid && (
              <FieldError>{fieldState.error?.message}</FieldError>
            )}
          </Field>
        )}
      />

      <Controller
        name="videoUrl"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor="videoUrl">
              Video de presentación
            </FieldLabel>

            <Input
              {...field}
              id="videoUrl"
              type="url"
              placeholder="https://..."
              autoComplete="url"
            />

            {fieldState.invalid && (
              <FieldError>{fieldState.error?.message}</FieldError>
            )}
          </Field>
        )}
      />

      {form.formState.errors.root && (
        <FieldError>
          {form.formState.errors.root.message}
        </FieldError>
      )}

      <Button
        type="submit"
        className="h-12 w-full"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting
          ? isEditing
            ? "Actualizando solicitud..."
            : "Creando solicitud..."
          : isEditing
            ? "Actualizar solicitud"
            : "Crear solicitud"}
      </Button>
    </form>
  );
};

export default CreditApplicationForm;