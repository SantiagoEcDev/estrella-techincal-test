"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { getCreditApplications } from "../services/creditApplication.service";
import type { CreditApplication } from "../types/creditApplication.types";
import CreditApplicationCard from "./CreditApplicationCard";

const CreditApplicationList = () => {
  const [applications, setApplications] = useState<CreditApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getCreditApplications();

        setApplications(data);
      } catch (error) {
        console.error(error);

        setError("No fue posible cargar las solicitudes");
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, []);

  const handleEdit = (application: CreditApplication) => {
    console.log("Editar solicitud:", application);
  };

  const handleDelete = (id: string) => {
    console.log("Eliminar solicitud:", id);
  };

  if (isLoading) {
    return (
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex min-h-56 flex-col gap-4 rounded-xl border p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>

              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>

              <div className="flex justify-between gap-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
              </div>

              <div className="flex justify-between gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-28" />
              </div>
            </div>

            <div className="mt-auto flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-48 w-full items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-6">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText />
          </EmptyMedia>

          <EmptyTitle>No tienes solicitudes de crédito</EmptyTitle>

          <EmptyDescription>
            Cuando envíes una solicitud de crédito, podrás consultar aquí su
            estado y la información relacionada.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {applications.map((application) => (
        <CreditApplicationCard
          key={application.id}
          application={application}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

export default CreditApplicationList;
