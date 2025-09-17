import { api } from "@/lib/utils";
import Playground from "./Playground";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data } = await api.get(`/workflow/${id}`);

  if (!data.success) {
    return <div>No Project with the given ID found</div>;
  }

  return <Playground workflow={data.data.workflow} />;
}
