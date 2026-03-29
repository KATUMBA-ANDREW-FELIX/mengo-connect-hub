import { Outlet } from "react-router-dom";
import { PublicNavbar } from "@/components/PublicNavbar";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-primary py-8">
        <div className="container mx-auto px-4 text-center text-primary-foreground/80">
          <p className="font-serif text-lg font-semibold text-primary-foreground">
            Mengo Senior School Student Council
          </p>
          <p className="mt-1 text-sm">Kampala, Uganda • Building Leaders for Tomorrow</p>
          <p className="mt-4 text-xs text-primary-foreground/50">
            © 2025/26 mengo councillors. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
