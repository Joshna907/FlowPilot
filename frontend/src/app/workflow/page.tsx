import { api } from "@/lib/utils";
import { WorkflowGrid } from "./components/WorkflowGrid";

export default async function Page() {
  const { data } = await api.get("/workflow/list");
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <WorkflowGrid workflows={data.data.workflows} />
      </div>
    </div>
  );
}
