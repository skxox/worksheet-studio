import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="text-center">
        <p className="text-primary text-sm font-semibold">404</p>
        <h1 className="text-display-sm mt-2">页面不存在</h1>
        <p className="text-muted-foreground mt-3">
          你访问的链接可能已失效，或该字帖类型不存在。
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/">
            <Button>返回首页</Button>
          </Link>
          <Link href="/copybook/character">
            <Button variant="outline">进入字帖工坊</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
