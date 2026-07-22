"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Pen, FileText, Grid3x3, ArrowRight } from "lucide-react";
import { springs } from "@/lib/motion";

const modules = [
  {
    id: "copybook",
    title: "字帖工坊",
    description:
      "汉字、词组、段落、笔画、拼音、英文、数字、控笔，多类型字帖一键生成。",
    icon: Pen,
    href: "/copybook",
  },
  {
    id: "handwriting",
    title: "手写模拟器",
    description:
      "文本转手写体，支持涂改、位置/笔画/字形凌乱度调节，真实纸张质感。",
    icon: FileText,
    href: "/handwriting",
  },
  {
    id: "paper",
    title: "纸张工厂",
    description:
      "方格、横线、点阵、康奈尔、五线谱、田字格、米字格、回宫格，导出 PDF/PNG/SVG。",
    icon: Grid3x3,
    href: "/paper",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: springs.default },
};

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:py-28">
          <motion.h1
            className="text-display"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springs.default}
          >
            好字是练出来的
          </motion.h1>
          <motion.p
            className="text-muted-foreground mx-auto mt-5 max-w-2xl text-lg leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.default, delay: 0.06 }}
          >
            输入内容即可生成可打印字帖，覆盖中英文与多种纸张，完全免费、无需登录。
          </motion.p>
        </div>
      </section>

      {/* Modules */}
      <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-14">
        <motion.div
          className="grid gap-6 md:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
        >
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <motion.div key={m.id} variants={item} whileHover={{ y: -4 }} whileTap={{ scale: 0.985 }} transition={springs.default}>
                <Link
                  href={m.href}
                  className="press group bg-card text-card-foreground flex h-full flex-col rounded-2xl border border-border/60 p-6 shadow-2"
                >
                  <div className="bg-muted text-foreground mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-display-sm tracking-tight">{m.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {m.description}
                  </p>
                  <span className="text-muted-foreground group-hover:text-foreground mt-6 inline-flex items-center gap-1 text-sm font-medium transition-colors">
                    立即使用
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </main>
  );
}
