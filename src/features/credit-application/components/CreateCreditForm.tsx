"use client";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { fetchAuthSession } from "aws-amplify/auth";
import { Upload, Video } from "lucide-react";
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

type FormValues = z.infer<typeof creditApplicationFormSchema>;

const CreditApplicationForm = ({
  application,
  onSuccess,
}: CreditApplicationFormProps) => {
  const isEditing = Boolean(application);

  const form = useForm<FormValues>({
    resolver: zodResolver(creditApplicationFormSchema),
    defaultValues: {
      identityDocument: application?.identityDocument ?? "",
      educationalInstitution: application?.educationalInstitution ?? "",
      academicProgram: application?.academicProgram ?? "",
      requestedAmount: application?.requestedAmount ?? 0,
      video: undefined,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      if (application) {
        await updateCreditApplication(application.id, {
          identityDocument: data.identityDocument,
          educationalInstitution: data.educationalInstitution,
          academicProgram: data.academicProgram,
          requestedAmount: data.requestedAmount,
        });

        toast.success("Solicitud actualizada exitosamente");
      } else {
        const session = await fetchAuthSession();

        const fullName = session.tokens?.idToken?.payload?.name;

        if (typeof fullName !== "string" || !fullName) {
          form.setError("root", {
            type: "server",
            message: "No se pudo obtener el nombre del usuario autenticado",
          });

          return;
        }

        await createCreditApplication({
          identityDocument: data.identityDocument,
          educationalInstitution: data.educationalInstitution,
          academicProgram: data.academicProgram,
          requestedAmount: data.requestedAmount,
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
            <FieldLabel htmlFor="requestedAmount">Monto solicitado</FieldLabel>

            <Input
              id="requestedAmount"
              type="text"
              inputMode="numeric"
              placeholder="Ingresa el monto solicitado"
              value={field.value ? field.value.toLocaleString("es-CO") : ""}
              onChange={(event) => {
                const rawValue = event.target.value.replace(/\D/g, "");

                field.onChange(rawValue === "" ? 0 : Number(rawValue));
              }}
            />

            {fieldState.invalid && (
              <FieldError>{fieldState.error?.message}</FieldError>
            )}
          </Field>
        )}
      />

      <Controller
        name="video"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor="video">Video de presentación</FieldLabel>

            <label
              htmlFor="video"
              className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Video className="h-5 w-5" />
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Upload className="h-4 w-4" />
                Seleccionar video
              </div>

              <p className="mt-1 text-xs text-slate-500">
                MP4 o WebM · Máximo 200 MB
              </p>

              {field.value && (
                <p className="mt-3 max-w-full truncate text-xs font-medium text-primary">
                  {field.value.name}
                </p>
              )}

              <input
                id="video"
                type="file"
                accept="video/mp4,video/webm"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  field.onChange(file);
                }}
              />
            </label>

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
