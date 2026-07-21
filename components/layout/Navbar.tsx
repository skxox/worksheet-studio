"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pen, FileText, Grid3x3, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/common/ThemeToggle";

const links = [
  { href: "/", label: "首页", icon: Home },
  { href: "/copybook", label: "字帖工坊", icon: Pen },
  { href: "/handwriting", label: "手写模拟器", icon: FileText },
  { href: "/paper", label: "纸张工厂", icon: Grid3x3 },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
        <Link
          href="/"
          className="mr-4 flex items-center gap-2 font-bold tracking-tight"
        >
          <Pen className="text-primary h-5 w-5" />
          <span className="text-base">字帖大师</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{l.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
