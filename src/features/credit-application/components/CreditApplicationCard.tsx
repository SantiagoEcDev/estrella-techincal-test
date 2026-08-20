"use client";

import {
  CalendarDays,
  GraduationCap,
  MoreHorizontal,
  School,
  Trash2,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { CreditApplication } from "../types/creditApplication.types";

type CreditApplicationCardProps = {
  application: CreditApplication;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
};

const statusConfig = {
  pending: {
    label: "Pendiente",
    variant: "secondary" as const,
  },
  approved: {
    label: "Aprobada",
    variant: "default" as const,
  },
  rejected: {
    label: "Rechazada",
    variant: "destructive" as const,
  },
};

const CreditApplicationCard = ({
  application,
  onDelete,
  isDeleting,
}: CreditApplicationCardProps) => {
  const status = statusConfig[application.status];

  const amount = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(application.requestedAmount);

  const date = new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(application.createdAt));

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold">
            {application.fullName}
          </h3>

          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <School className="size-4 shrink-0" />
            <span className="truncate">
              {application.educationalInstitution}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={status.variant}>{status.label}</Badge>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Abrir menú</span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">

              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(application.id)}
                disabled={isDeleting}
              >
                <Trash2 className="size-4" />
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <GraduationCap className="mt-0.5 size-5 shrink-0 text-muted-foreground" />

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Programa académico
              </p>

              <p className="mt-1 truncate text-sm font-medium">
                {application.academicProgram}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Monto solicitado</p>

            <p className="mt-1 text-sm font-semibold">{amount}</p>
          </div>

          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 size-5 shrink-0 text-muted-foreground" />

            <div>
              <p className="text-xs text-muted-foreground">
                Fecha de solicitud
              </p>

              <p className="mt-1 text-sm font-medium">{date}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditApplicationCard;
