"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { getUserName } from "@/features/user/services/getUserName.service";

const DashboardHero = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoadingName, setIsLoadingName] = useState(true);

  useEffect(() => {
    const loadUserName = async () => {
      try {
        const name = await getUserName();

        setUserName(name);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingName(false);
      }
    };

    loadUserName();
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl border bg-card p-8 shadow-sm md:p-10">
      <div className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/5 blur-3xl" />

      <div className="absolute -bottom-24 left-1/3 size-56 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <GraduationCap className="size-6" />
          </div>

          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Tu espacio de crédito educativo
          </p>

          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {isLoadingName ? (
              <span className="inline-block h-10 w-56 animate-pulse rounded-lg bg-muted" />
            ) : (
              <>
                Hola, {userName ?? "Usuario"} 
              </>
            )}
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Gestiona tus solicitudes de crédito educativo de forma sencilla y
            consulta el estado de cada proceso desde un solo lugar.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/credit-applications"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Ver mis solicitudes
              <ArrowRight className="size-4" />
            </Link>

          </div>
        </div>

        <div className="hidden shrink-0 md:block">
          <div className="flex size-40 items-center justify-center rounded-full bg-primary/5">
            <div className="flex size-28 items-center justify-center rounded-full bg-primary/10">
              <GraduationCap className="size-14 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardHero;
