import { AppMobileHeader } from "@/components/app-shell/app-mobile-header";
import { AppMobileNav } from "@/components/app-shell/app-mobile-nav";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function InternalAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppMobileHeader />
      <div className="grid min-h-screen lg:grid-cols-[18rem_1fr]">
        <div className="hidden lg:block">
          <AppSidebar />
        </div>
        <main className="min-w-0 px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-8">
          <div className="mb-6 hidden justify-end lg:flex">
            <ThemeToggle />
          </div>
          {children}
        </main>
      </div>
      <AppMobileNav />
    </div>
  );
}