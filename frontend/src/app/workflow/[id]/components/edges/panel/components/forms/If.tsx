import { TextAreaWithMention } from "@/components/TextAreaWithMentions";
import { Button } from "@/components/ui/button";
import { useWorkflow } from "@/stores";
import { EdgeType } from "@/stores/useWorkflowStore";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

const ifEdgeFormMetadataSchema = z
  .object({ expression: z.string() })
  .optional()
  .nullable();

export function IfEdgeForm() {
  const [expression, setExpression] = useState("");
  const selectedEdge = useWorkflow((state) => {
    return state.edges.find((edge) => edge.id === state.selectedEdgeId);
  });
  const updateSelectedEdge = useWorkflow((state) => {
    return state.updateSelectedEdge;
  });
  console.log({ m: selectedEdge?.data });
  const { data: parsedMetadata, success } = ifEdgeFormMetadataSchema.safeParse(
    selectedEdge?.data,
  );
  if (!success) {
    toast.error("Parsing error");
    return <></>;
  }

  function handleTextAreaValueChange(valueWithIds: string) {
    setExpression(valueWithIds);
  }

  function handleSubmit() {
    updateSelectedEdge({
      type: EdgeType.IF,
      metadata: { expression: expression },
    });
  }

  return (
    <>
      <TextAreaWithMention
        defaultValue={parsedMetadata?.expression}
        onResolvedChange={handleTextAreaValueChange}
        placeholder=""
        className="resize-none"
      />
      <Button onClick={handleSubmit}>Submit</Button>
    </>
  );
}
