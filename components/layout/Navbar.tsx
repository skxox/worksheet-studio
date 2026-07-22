"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Pen, FileText, Grid3x3, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { springs } from "@/lib/motion";

const links = [
  { href: "/", label: "首页", icon: Home },
  { href: "/copybook", label: "字帖工坊", icon: Pen },
  { href: "/handwriting", label: "手写模拟器", icon: FileText },
  { href: "/paper", label: "纸张工厂", icon: Grid3x3 },
];

export function Navbar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="glass sticky top-0 z-40 w-full">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
        <Link
          href="/"
          className="press mr-4 flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="bg-primary text-primary-foreground grid h-7 w-7 place-items-center rounded-lg shadow-1">
            <Pen className="h-4 w-4" />
          </span>
          <span className="text-base">字帖大师</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const active = isActive(l.href);
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "press relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="bg-secondary absolute inset-0 rounded-lg shadow-1"
                    transition={springs.default}
                  />
                )}
                <Icon className="relative h-4 w-4" />
                <span className="relative hidden sm:inline">{l.label}</span>
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
