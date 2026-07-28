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

export function HomeModules() {
  return (
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
          <motion.div
            key={m.id}
            variants={item}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.985 }}
            transition={springs.default}
          >
            <Link
              href={m.href}
              className="press group bg-card text-card-foreground border-border/60 shadow-2 flex h-full flex-col rounded-2xl border p-6"
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
  );
}
