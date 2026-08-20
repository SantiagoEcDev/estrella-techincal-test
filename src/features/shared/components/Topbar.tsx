"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { getUserName } from "@/features/user/services/getUserName.service";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ROUTE_LABELS: Record<string, string> = {
  "credit-applications": "Solicitudes de crédito",
  settings: "Configuración",
  profile: "Perfil",
};

const formatSegment = (segment: string) => {
  if (ROUTE_LABELS[segment]) return ROUTE_LABELS[segment];

  return segment
    .replace(/-/g, " ")
    .replace(/^\w/, (char) => char.toUpperCase());
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);

  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "U";
};

const Topbar = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoadingName, setIsLoadingName] = useState(true);

  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

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
    <header className="flex h-16 w-full items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger />

        <Separator orientation="vertical" className="h-6" />

        <nav
          aria-label="Ruta actual"
          className="flex min-w-0 items-center gap-1.5 text-sm"
        >
          <span className="shrink-0 text-muted-foreground">Estrella</span>

          {segments.length === 0 ? (
            <>
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate font-medium text-foreground">
                Inicio
              </span>
            </>
          ) : (
            segments.map((segment, index) => {
              const isLast = index === segments.length - 1;

              return (
                <span
                  key={segment}
                  className="flex min-w-0 items-center gap-1.5"
                >
                  <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />

                  <span
                    className={
                      isLast
                        ? "truncate font-medium text-foreground"
                        : "truncate text-muted-foreground"
                    }
                  >
                    {formatSegment(segment)}
                  </span>
                </span>
              );
            })
          )}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {isLoadingName ? (
          <>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-9 rounded-full" />
          </>
        ) : (
          <>
            <span className="hidden text-sm font-medium sm:inline">
              {userName ?? "Usuario"}
            </span>

            <Avatar className="size-9">
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                {getInitials(userName ?? "Usuario")}
              </AvatarFallback>
            </Avatar>
          </>
        )}
      </div>
    </header>
  );
};

export default Topbar;
