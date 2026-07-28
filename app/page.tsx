import { HomeModules } from "./_components/home-modules";

// 服务端组件：Hero 静态渲染（零客户端 JS），仅模块卡片区作为客户端岛屿 <HomeModules />。
export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="border-border/40 border-b">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:py-28">
          <h1 className="text-display">好字是练出来的</h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-lg leading-relaxed">
            输入内容即可生成可打印字帖，覆盖中英文与多种纸张，完全免费、无需登录。
          </p>
        </div>
      </section>

      {/* Modules —— 客户端岛屿（含交错入场动画） */}
      <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-14">
        <HomeModules />
      </section>
    </main>
  );
}
