import Link from "next/link";
import { Pen, FileText, Grid3x3, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const modules = [
  {
    id: "copybook",
    title: "字帖工坊",
    description:
      "汉字、词组、段落、笔画、拼音、英文、数字、控笔，多类型字帖一键生成。",
    icon: Pen,
    href: "/copybook",
    accent: "text-blue-600",
    bg: "bg-blue-50 hover:bg-blue-100",
  },
  {
    id: "handwriting",
    title: "手写模拟器",
    description:
      "文本转手写体，支持涂改、位置/笔画/字形凌乱度调节，真实纸张质感。",
    icon: FileText,
    href: "/handwriting",
    accent: "text-amber-600",
    bg: "bg-amber-50 hover:bg-amber-100",
  },
  {
    id: "paper",
    title: "纸张工厂",
    description:
      "方格、横线、点阵、康奈尔、五线谱、田字格、米字格、回宫格，导出 PDF/PNG/SVG。",
    icon: Grid3x3,
    href: "/paper",
    accent: "text-emerald-600",
    bg: "bg-emerald-50 hover:bg-emerald-100",
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="from-muted/50 to-background border-b bg-linear-to-b">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            好字是练出来的
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            输入内容即可生成可打印字帖，覆盖中英文与多种纸张，完全免费、无需登录。
          </p>
        </div>
      </section>

      {/* Modules */}
      <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link key={m.id} href={m.href} className="group">
                <Card className="bg-muted/40 h-full cursor-pointer border-0 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <CardHeader>
                    <div
                      className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${m.bg} ${m.accent}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="flex items-center text-xl">
                      {m.title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm leading-relaxed">
                      {m.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-primary inline-flex items-center text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
                      立即使用 <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
