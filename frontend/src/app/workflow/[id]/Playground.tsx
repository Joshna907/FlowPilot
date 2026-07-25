"use client";

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { useWorkflow } from "@/stores";
import {
  createInitialWorkflowGraph,
  edgeTypes,
  NodeType,
  nodeTypes,
} from "@/stores/useWorkflowStore";
import { useCallback, useEffect } from "react";
import { useState } from "react";
import _ from "lodash";
import { api, convertApiEdgeToState, convertApiNodeToState } from "@/lib/utils";
import { UpdateWorkflowButton } from "./components/buttons/UpdateWorkflow";
import { ApiWorkflow } from "../types";
import { NodesPanel } from "./components/nodes/panel";
import { EdgesPanel } from "./components/edges/panel";
import { VoiceBuilder } from "./components/voice/VoiceBuilder";
import { RunWorkflowButton } from "./components/run/RunWorkflowButton";
import { RunStatus } from "./components/run/runStatus";
import {
  assertWorkflowEditorReady,
  buildWorkflowSavePayload,
} from "./components/run/runWorkflowPayload";
import { IntegrationLibrary } from "./components/integrations/IntegrationLibrary";
import {
  ExecutionHistoryItem,
  getExecutionFailedNodeId,
  getFriendlyExecutionStatus,
  getFriendlyExecutionTime,
  getFriendlyRunLabel,
  mergeExecutionHistory,
} from "@/lib/executionHistory";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import {
  AudioLines,
  Bot,
  Clock3,
  Check,
  DatabaseZap,
  Gauge,
  GitBranch,
  Globe,
  History,
  Home,
  KeyRound,
  Library,
  Mail,
  MousePointerClick,
  Plus,
  Redo2,
  RefreshCcw,
  Reply,
  RotateCcw,
  Search,
  Settings,
  Undo2,
  Workflow,
  Zap,
} from "lucide-react";

const paletteItems = [
  {
    title: "Manual trigger",
    body: "Start when you click run.",
    icon: MousePointerClick,
  },
  { title: "Webhook", body: "Start from an external URL.", icon: GitBranch },
  { title: "Send email", body: "Send Gmail messages.", icon: Mail },
  { title: "Await reply", body: "Pause until a reply arrives.", icon: Reply },
  { title: "HTTP request", body: "Call an API endpoint.", icon: Globe },
];

export default function Playground({
  workflow,
  initialVoiceBuilderOpen = false,
}: {
  workflow: ApiWorkflow;
  initialVoiceBuilderOpen?: boolean;
}) {
  const nodes = useWorkflow((state) => state.nodes);
  const edges = useWorkflow((state) => state.edges);
  const setNodes = useWorkflow((state) => state.setNodes);
  const setEdges = useWorkflow((state) => state.setEdges);
  const loadWorkflow = useWorkflow((state) => state.loadWorkflow);
  const activeWorkflowId = useWorkflow((state) => state.workflow.id);
  const addNewEmptyNode = useWorkflow((state) => state.addNewEmptyNode);
  const deleteNode = useWorkflow((state) => state.deleteNode);
  const undo = useWorkflow((state) => state.undo);
  const redo = useWorkflow((state) => state.redo);
  const canUndo = useWorkflow((state) => state.canUndo);
  const canRedo = useWorkflow((state) => state.canRedo);
  const selectedNodeId = useWorkflow((state) => state.selectedNodeId);
  const [runStatus, setRunStatus] = useState<RunStatus>("idle");
  const [publishStatus, setPublishStatus] = useState<"Draft" | "Published">(
    workflow.publishedAt ? "Published" : "Draft",
  );
  const [executionHistory, setExecutionHistory] = useState<
    ExecutionHistoryItem[]
  >([]);
  const [selectedExecutionId, setSelectedExecutionId] = useState<
    string | undefined
  >();
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const isWorkflowReady = activeWorkflowId === workflow.id;

  const loadExecutionHistory = useCallback(async () => {
    if (!workflow.id) return;
    setIsHistoryLoading(true);
    try {
      const { data } = await api.get(`/execution/workflow/${workflow.id}`);
      if (data.success) {
        setExecutionHistory(data.data.executions);
        setSelectedExecutionId((current) => {
          if (current) return current;
          return data.data.executions[0]?.id;
        });
      }
    } catch {
      toast.error("Unable to load recent runs");
    } finally {
      setIsHistoryLoading(false);
    }
  }, [workflow.id]);

  const publishWorkflow = useMutation({
    mutationFn: async () => {
      assertWorkflowEditorReady({
        expectedWorkflowId: workflow.id,
        activeWorkflowId,
        nodes,
      });
      const payload = buildWorkflowSavePayload(nodes, edges);
      const saveResponse = await api.put(
        `/workflow/update/${workflow.id}`,
        payload,
      );
      const savedNodes = saveResponse.data.data?.nodes?.length ?? 0;
      if (!saveResponse.data.success || savedNodes === 0) {
        throw new Error("Unable to save workflow before publishing");
      }
      return api.post(`/workflow/publish/${workflow.id}`);
    },
    onSuccess: ({ data }) => {
      if (!data.success) {
        toast.error("Unable to publish workflow");
        return;
      }
      setPublishStatus("Published");
      toast.success("Workflow published");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "This workflow is not ready to publish. Save or refresh and try again.",
      ),
  });

  useEffect(() => {
    const apiNodes = workflow.nodes;
    const graph = !_.isEmpty(apiNodes)
      ? {
          nodes: apiNodes.map(convertApiNodeToState),
          edges: workflow.edges.map(convertApiEdgeToState),
        }
      : createInitialWorkflowGraph();

    loadWorkflow({
      workflow: {
        id: workflow.id,
        name: workflow.name,
      },
      graph,
    });

    setPublishStatus(workflow.publishedAt ? "Published" : "Draft");
  }, [workflow, loadWorkflow]);

  useEffect(() => {
    void loadExecutionHistory();
  }, [loadExecutionHistory]);

  const handleQueuedExecution = useCallback(
    (execution: ExecutionHistoryItem) => {
      setExecutionHistory((history) => mergeExecutionHistory(history, execution));
      setSelectedExecutionId(execution.id);
      void loadExecutionHistory();
    },
    [loadExecutionHistory],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange<Node>[]) =>
      setNodes((nds: Node[]) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (
        selectedNodeId &&
        (event.key === "Delete" || event.key === "Backspace")
      ) {
        deleteNode(selectedNodeId);
      }
    },
    [deleteNode, selectedNodeId],
  );

  const needsConfigCount = nodes.filter((node) =>
    Boolean(node.data?.needsConfig),
  ).length;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--flow-bg)] text-[var(--flow-ink)]">
      <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-[var(--flow-border)] bg-white px-4 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--flow-primary)] text-white">
            <AudioLines className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-sm font-semibold md:text-base">
                {workflow.name}
              </h1>
              <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                {publishStatus}
              </span>
            </div>
            <div className="text-xs font-medium uppercase text-[var(--flow-muted)]">
              FlowPilot editor
            </div>
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="outline"
            className="hidden md:inline-flex"
            disabled={!canUndo}
            onClick={undo}
          >
            <Undo2 />
            Undo
          </Button>
          <Button
            variant="outline"
            className="hidden md:inline-flex"
            disabled={!canRedo}
            onClick={redo}
          >
            <Redo2 />
            Redo
          </Button>
          <Button
            variant="outline"
            className="hidden md:inline-flex"
            onClick={() => setRunStatus("idle")}
          >
            <RotateCcw />
            Reset run
          </Button>
          <RunWorkflowButton
            workflowId={workflow.id}
            status={runStatus}
            onStatusChange={setRunStatus}
            compact
            onQueued={handleQueuedExecution}
          />
          <VoiceBuilder initialOpen={initialVoiceBuilderOpen} />
          <UpdateWorkflowButton
            className="hidden sm:inline-flex"
            workflowId={workflow.id}
          />
          <Button
            className="hidden md:inline-flex"
            disabled={
              publishWorkflow.isPending || !workflow.id || !isWorkflowReady
            }
            onClick={() => publishWorkflow.mutate()}
          >
            Publish
          </Button>
        </div>
      </header>

      <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-[var(--flow-border)] bg-white px-3 py-2 sm:hidden">
        <UpdateWorkflowButton workflowId={workflow.id} />
        <Button variant="outline" onClick={addNewEmptyNode}>
          <Plus />
          Step
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[64px_260px_1fr_320px]">
        <aside className="hidden border-r border-[#332823] bg-[#382c28] py-3 text-white lg:block">
          <RailIcon icon={Home} label="Dashboard" href="/" />
          <RailIcon icon={Workflow} label="Workflows" href="/workflow" active />
          <RailIcon
            icon={History}
            label="Runs"
            onClick={() => toast.info("Recent runs are on the right panel.")}
          />
          <RailIcon
            icon={KeyRound}
            label="Credentials"
            onClick={() =>
              toast.info("Open a Slack, Discord, or WhatsApp node config to save credentials.")
            }
          />
          <IntegrationLibrary
            trigger={
              <button
                className={getRailIconClass(false)}
                title="Integrations"
                type="button"
              >
                <DatabaseZap className="size-5" />
              </button>
            }
          />
          <RailIcon
            icon={Settings}
            label="Settings"
            onClick={() => toast.info("Settings are coming after core editor flow.")}
          />
        </aside>

        <aside className="hidden border-r border-[var(--flow-border)] bg-white p-4 lg:block">
          <div className="mb-4">
            <div className="text-xs font-semibold uppercase text-[var(--flow-muted)]">
              Step palette
            </div>
            <p className="mt-1 text-sm text-[var(--flow-muted)]">
              Add manually, or let voice draft the path.
            </p>
          </div>
          <div className="space-y-2">
            {paletteItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-lg border border-[var(--flow-border)] bg-[var(--flow-bg)] p-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 items-center justify-center rounded-md bg-white text-[var(--flow-primary)] shadow-sm">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <div className="text-sm font-medium">{item.title}</div>
                      <p className="text-xs leading-5 text-[var(--flow-muted)]">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <IntegrationLibrary
            trigger={
              <Button className="mt-4 w-full" variant="outline">
                <Library />
                Open app library
              </Button>
            }
          />
          <Button
            className="mt-2 w-full"
            variant="outline"
            onClick={addNewEmptyNode}
          >
            <Plus />
            Add blank step
          </Button>
        </aside>

        <main
          className="relative min-h-0 overflow-hidden"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-sm rounded-lg border border-[var(--flow-border)] bg-white/92 p-3 shadow-sm backdrop-blur">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
              <Workflow className="size-4 text-[var(--flow-primary)]" />
              Canvas
            </div>
            <p className="text-xs leading-5 text-[var(--flow-muted)]">
              Double-click a node to configure it. Voice-generated steps glow
              briefly so the draft feels alive.
            </p>
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onConnect={onConnect}
            fitView
            className="flow-canvas"
          >
            <Controls />
            <Background color="#cfd9d2" gap={22} />
          </ReactFlow>
          <div className="absolute bottom-4 left-4 z-10 hidden items-center gap-2 rounded-lg border border-[var(--flow-border)] bg-white p-2 shadow-sm lg:flex">
            <IntegrationLibrary
              trigger={
                <Button variant="outline">
                  <Library />
                  Library
                </Button>
              }
            />
            <Button variant="outline" onClick={addNewEmptyNode}>
              <Plus />
              Add step
            </Button>
            <VoiceBuilder
              trigger={
                <Button variant="outline">
                  <Zap />
                  Voice/AI
                </Button>
              }
            />
            <Button variant="outline" disabled>
              <Search />
              Search
            </Button>
            <Button variant="outline" disabled>
              <Gauge />
              Fit view
            </Button>
          </div>
          <div className="absolute bottom-4 left-4 right-4 z-10 lg:hidden">
            <RunWorkflowButton
              workflowId={workflow.id}
              status={runStatus}
              onStatusChange={setRunStatus}
              onQueued={handleQueuedExecution}
            />
          </div>
        </main>

        <aside className="hidden border-l border-[var(--flow-border)] bg-white p-4 lg:block">
          <div className="mb-4 flex items-center gap-2">
            <Bot className="size-4 text-[var(--flow-primary)]" />
            <div className="text-sm font-semibold">Setup</div>
          </div>
          <div className="space-y-3">
            <HealthItem label="Steps" value={String(nodes.length)} />
            <HealthItem label="Links" value={String(edges.length)} />
            <HealthItem
              label="Start point"
              value={String(
                nodes.filter(
                  (node) =>
                    node.type === NodeType.MANUAL_TRIGGER ||
                    node.type === NodeType.WEBHOOK_TRIGGER,
                ).length,
              )}
            />
            <HealthItem
              label="Needs setup"
              tone="warn"
              value={String(needsConfigCount)}
            />
          </div>
          <div className="mt-5 rounded-lg border border-[var(--flow-border)] bg-[var(--flow-bg)] p-4">
            <div className="text-sm font-semibold">Ready check</div>
            <div className="mt-3 space-y-2 text-sm text-[var(--flow-muted)]">
              <ChecklistRow done={nodes.length > 1} label="Steps added" />
              <ChecklistRow done={edges.length > 0} label="Steps linked" />
              <ChecklistRow
                done={nodes.some((node) => node.type !== NodeType.EMPTY)}
                label="Actions chosen"
              />
              <ChecklistRow done={needsConfigCount === 0} label="Setup done" />
            </div>
          </div>
          <div className="mt-5">
            <RunWorkflowButton
              workflowId={workflow.id}
              status={runStatus}
              onStatusChange={setRunStatus}
              onQueued={handleQueuedExecution}
            />
          </div>
          <div className="mt-5 rounded-lg border border-[var(--flow-border)] bg-[var(--flow-bg)] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock3 className="size-4 text-[var(--flow-primary)]" />
                Recent runs
              </div>
              <Button
                variant="outline"
                size="icon-xs"
                disabled={isHistoryLoading}
                onClick={() => void loadExecutionHistory()}
                title="Refresh history"
              >
                <RefreshCcw className="size-3" />
              </Button>
            </div>
            <div className="space-y-2">
              {executionHistory.length === 0 ? (
                <p className="text-xs leading-5 text-[var(--flow-muted)]">
                  Runs appear here after you start one.
                </p>
              ) : (
                executionHistory.map((execution, index) => (
                  <button
                    key={execution.id}
                    onClick={() => setSelectedExecutionId(execution.id)}
                    className={`w-full rounded-md border p-2 text-left text-xs ${
                      selectedExecutionId === execution.id
                        ? "border-[var(--flow-primary)] bg-white"
                        : "border-[var(--flow-border)] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">
                        {getFriendlyRunLabel(index)}
                      </span>
                      {getExecutionFailedNodeId(execution.output) && (
                        <span className="text-[#9A5B00]">Needs attention</span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2 text-[var(--flow-muted)]">
                      <span>{getFriendlyExecutionStatus(execution.status)}</span>
                      <span>{getFriendlyExecutionTime(execution.createdAt)}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
            <ExecutionDetail
              workflowId={workflow.id}
              execution={executionHistory.find(
                (execution) => execution.id === selectedExecutionId,
              )}
            />
          </div>
        </aside>
      </div>

      <NodesPanel />
      <EdgesPanel />
    </div>
  );
}

function ExecutionDetail({
  workflowId,
  execution,
}: {
  workflowId: string;
  execution: ExecutionHistoryItem | undefined;
}) {
  if (!execution) return null;
  const failedNodeId = getExecutionFailedNodeId(execution.output);

  return (
    <div className="mt-3 border-t border-[var(--flow-border)] pt-3 text-xs">
      <div className="font-semibold">What happened</div>
      <div className="mt-2 space-y-1 text-[var(--flow-muted)]">
        <div>{getFriendlyExecutionStatus(execution.status)}</div>
        {failedNodeId && <div>Step that needs attention</div>}
        <div>{getFriendlyExecutionTime(execution.createdAt)}</div>
      </div>
      <Link
        href={`/workflow/${workflowId}/runs/${execution.id}`}
        className="mt-2 inline-flex text-xs font-semibold text-[var(--flow-primary)]"
      >
        Open technical details
      </Link>
    </div>
  );
}

function RailIcon({
  icon: Icon,
  label,
  active = false,
  href,
  onClick,
}: {
  icon: typeof Home;
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <Icon className="size-5" />
      <span className="sr-only">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={getRailIconClass(active)} title={label}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={getRailIconClass(active)}
      title={label}
      type="button"
      onClick={onClick}
    >
      {content}
    </button>
  );
}

function getRailIconClass(active: boolean) {
  return `mx-auto mb-3 flex size-10 items-center justify-center rounded-lg ${
    active ? "bg-white text-[#382c28]" : "text-white/70 hover:bg-white/10"
  }`;
}

function HealthItem({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warn";
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--flow-border)] bg-[var(--flow-bg)] px-3 py-2">
      <span className="text-sm text-[var(--flow-muted)]">{label}</span>
      <span
        className={
          tone === "warn"
            ? "rounded-full bg-[rgba(245,165,36,0.16)] px-2 py-0.5 text-sm font-semibold text-[#9A5B00]"
            : "text-sm font-semibold"
        }
      >
        {value}
      </span>
    </div>
  );
}

function ChecklistRow({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex size-4 items-center justify-center rounded-full ${
          done
            ? "bg-[var(--flow-primary)] text-white"
            : "bg-[var(--flow-border)]"
        }`}
      >
        {done && <Check className="size-3" />}
      </span>
      {label}
    </div>
  );
}
