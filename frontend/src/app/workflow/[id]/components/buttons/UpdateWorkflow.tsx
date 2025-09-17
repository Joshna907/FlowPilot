import { Button } from "@/components/ui/button";
import { useWorkflow } from "@/stores";
import { useMutation } from "@tanstack/react-query";
// import { v4 as uuidv4 } from "uuid";

export function UpdateWorkflowButton() {
  const nodes = useWorkflow((state) => state.nodes);
  const edges = useWorkflow((state) => state.edges);
  const setNodes = useWorkflow((state) => state.setNodes);
  const setEdges = useWorkflow((state) => state.setEdges);

  const updateWorkflow = useMutation({
    mutationFn: (input: { nodes: NodeInput[]; edges: EdgeInput[] }) => {
      return axios.post("/api/workflow/update", input);
    },
    onSuccess: ({ data }) => {
      if (!data.success) {
        toast.error("error updating workflow");
      }
      toast.success("workflow updated successfully");
    },
  });

  function handleSave() {
    // check if any changes have happened
    const nodesInput: NodeInput[] = [
      {
        id: "n1",
        positionX: 0,
        positionY: 100,
        nodeTypeId: "6575386d-95a3-4f4a-866c-01e5763aeb38",
        metadata: JSON.stringify({ label: "Node 1" }),
      },
      {
        id: "nE",
        positionX: 0,
        positionY: 100,
        nodeTypeId: "6575386d-95a3-4f4a-866c-01e5763aeb38",
        metadata: JSON.stringify({}),
      },
    ];
    const edgeInput: EdgeInput[] = [
      {
        id: "n1-nE",
        sourceNodeId: "n1",
        targetNodeId: "nE",
      },
    ];
    createWorkflow.mutate({ nodes: nodesInput, edges: edgeInput });
  }
  return <Button>Save</Button>;
}
