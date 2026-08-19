"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { FileText, LayoutDashboard, LogOut, Star } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "aws-amplify/auth";
import toast from "react-hot-toast";

const navigation = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Credit Applications",
    url: "/credit-applications",
    icon: FileText,
  },
];

const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("No fue posible cerrar sesión");
    }
  };

  return (
    <Sidebar className="border-r border-slate-200">
      <SidebarHeader className="px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Star className="h-4.5 w-4.5 fill-primary-foreground" />
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              Education Estrella
            </span>

            <span className="text-xs text-slate-500">Panel de créditos</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="px-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Menú
          </SidebarGroupLabel>

          <SidebarGroupContent className="mt-1">
            <SidebarMenu className="gap-1">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.url || pathname.startsWith(`${item.url}/`);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      className={cn(
                        "group relative h-10 rounded-lg px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900",
                        isActive &&
                          "bg-primary/10 text-slate-900 hover:bg-primary/10 hover:text-slate-900",
                      )}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                        )}

                        <span
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors",
                            "group-hover:text-slate-600",
                            isActive &&
                              "bg-primary/15 text-primary group-hover:text-primary",
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                        </span>

                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto px-3 pb-4">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="group h-10 rounded-lg px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors group-hover:text-slate-600">
                    <LogOut className="h-4 w-4" />
                  </span>

                  <span>Cerrar sesión</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
