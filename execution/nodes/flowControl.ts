import z from "zod";

const delaySchema = z.object({
  durationMs: z.coerce.number().int().min(0).max(30_000).default(1_000),
});

const filterSchema = z.object({
  left: z.unknown(),
  operator: z
    .enum(["equals", "not_equals", "contains", "exists"])
    .default("equals"),
  right: z.unknown().optional(),
});

function stringify(value: unknown) {
  if (typeof value === "string") return value;
  if (value === undefined || value === null) return "";
  return String(value);
}

export async function executeDelay(metadata: Record<string, unknown>) {
  const { durationMs } = delaySchema.parse(metadata);
  await new Promise((resolve) => setTimeout(resolve, durationMs));
  return { delayed: true, durationMs };
}

export async function executeFilter(metadata: Record<string, unknown>) {
  const data = filterSchema.parse(metadata);
  const left = stringify(data.left);
  const right = stringify(data.right);
  const passed =
    data.operator === "exists"
      ? left.length > 0
      : data.operator === "contains"
        ? left.includes(right)
        : data.operator === "not_equals"
          ? left !== right
          : left === right;

  return {
    passed,
    operator: data.operator,
    left,
    right,
  };
}
