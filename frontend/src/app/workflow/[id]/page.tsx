import { api } from "@/lib/utils";
import Playground from "./Playground";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ voice?: string }>;
}) {
  const { id } = await params;
  const { voice } = await searchParams;
  const { data } = await api.get(`/workflow/${id}`);

  if (!data.success) {
    return <div>No Project with the given ID found</div>;
  }

  return <Playground initialVoiceBuilderOpen={voice === "1"} workflow={data.data.workflow} />;
}
