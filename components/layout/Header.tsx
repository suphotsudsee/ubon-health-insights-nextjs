"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Activity,
  BarChart3,
  Building,
  ChevronDown,
  LayoutDashboard,
  Leaf,
  List,
  LogIn,
  LogOut,
  Menu,
  MinusCircle,
  PlusCircle,
  Settings,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type NavChildItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavChildItem[];
};

const financeNavItems: NavChildItem[] = [
  { href: "/finance/income/create", label: "บันทึกรายรับ", icon: PlusCircle },
  { href: "/finance/expense/create", label: "บันทึกรายจ่าย", icon: MinusCircle },
  { href: "/finance/list", label: "รายการข้อมูล", icon: List },
  { href: "/finance/dashboard", label: "Dashboard สถานะเงินบำรุง", icon: LayoutDashboard },
];

const publicNavItems: NavItem[] = [
  { href: "/", label: "ภาพรวม", icon: LayoutDashboard },
  { href: "/basic-info", label: "ข้อมูลพื้นฐาน", icon: Building },
  { href: "/finance/dashboard", label: "การเงิน", icon: Wallet, children: financeNavItems },
  { href: "/ppfs", label: "PPFS", icon: Activity },
  { href: "/ttm", label: "แพทย์แผนไทย", icon: Leaf },
  { href: "/comparison", label: "เปรียบเทียบ", icon: BarChart3 },
];

const settingsNavItem: NavItem = { href: "/settings", label: "Settings", icon: Settings };

function NavLinks({
  mobile = false,
  isAuthenticated = false,
}: {
  mobile?: boolean;
  isAuthenticated?: boolean;
}) {
  const pathname = usePathname();
  const navItems = isAuthenticated ? [...publicNavItems, settingsNavItem] : publicNavItems;

  return (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.children ? pathname.startsWith("/finance") : pathname === item.href;

        if (item.children && !mobile) {
          return (
            <div key={item.href} className="group relative">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                <ChevronDown className="h-4 w-4" />
              </Link>
              <div className="invisible absolute left-0 top-full z-50 min-w-[280px] translate-y-1 opacity-0 transition-all group-hover:visible group-hover:translate-y-2 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-2 group-focus-within:opacity-100">
                <div className="rounded-xl border bg-card p-2 shadow-lg">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const isChildActive = pathname === child.href;

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                          isChildActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        <ChildIcon className="h-4 w-4" />
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }

        if (item.children && mobile) {
          return (
            <div key={item.href} className="space-y-2">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-base font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
              <div className="ml-5 flex flex-col gap-1 border-l pl-3">
                {item.children.map((child) => {
                  const ChildIcon = child.icon;
                  const isChildActive = pathname === child.href;

                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                        isChildActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <ChildIcon className="h-4 w-4" />
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all",
              mobile ? "text-base" : "text-sm",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className={cn("h-4 w-4", mobile && "h-5 w-5")} />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function Header() {
  const { data: session, status } = useSession();
  const currentUser = session?.user as { name?: string | null; role?: string } | undefined;
  const isAuthenticated = status === "authenticated";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <svg className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight text-primary">ระบบติดตามตัวชี้วัด</span>
            <span className="text-xs text-muted-foreground">รพ.สต. อบจ.อุบลราชธานี</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <NavLinks isAuthenticated={isAuthenticated} />
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <div className="rounded-full border bg-background px-3 py-1.5 text-right">
                <p className="text-sm font-medium leading-none">{currentUser?.name || "ผู้ใช้งาน"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{currentUser?.role || "authenticated"}</p>
              </div>
              <Button variant="outline" onClick={() => void signOut({ callbackUrl: "/" })}>
                <LogOut className="mr-2 h-4 w-4" />
                ออกจากระบบ
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                เข้าสู่ระบบ
              </Link>
            </Button>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <div className="mt-8 flex flex-col gap-4">
              <NavLinks mobile isAuthenticated={isAuthenticated} />
              <div className="mt-2 border-t pt-4">
                {isAuthenticated ? (
                  <>
                    <div className="mb-3 rounded-xl border bg-muted/40 px-3 py-3">
                      <p className="font-medium">{currentUser?.name || "ผู้ใช้งาน"}</p>
                      <p className="text-sm text-muted-foreground">{currentUser?.role || "authenticated"}</p>
                    </div>
                    <Button className="w-full" variant="outline" onClick={() => void signOut({ callbackUrl: "/" })}>
                      <LogOut className="mr-2 h-4 w-4" />
                      ออกจากระบบ
                    </Button>
                  </>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      เข้าสู่ระบบ
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
