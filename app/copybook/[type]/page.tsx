import { notFound } from "next/navigation";
import { CopybookWorkbenchShell } from "../_components/workspace/copybook-workbench-shell";
import { isCopybookType } from "../copybook-metadata";

export default async function CopybookTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  if (!isCopybookType(type)) {
    notFound();
  }

  return <CopybookWorkbenchShell initialType={type} />;
}
