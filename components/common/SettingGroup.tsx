import * as React from "react";
import { cn } from "@/lib/utils";

interface SettingGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/** 设置面板中的分组容器：标题 + 描述 + 内容 */
export function SettingGroup({
  title,
  description,
  children,
  className,
}: SettingGroupProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <div className="space-y-0.5">
          <h3 className="text-sm leading-none font-semibold">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-xs">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
