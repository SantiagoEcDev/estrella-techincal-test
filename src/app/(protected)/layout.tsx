import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/features/dashboard/components/AppSidebar";
import Topbar from "@/features/shared/components/Topbar";
import { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar />

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
