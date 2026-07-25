import express from "express";
import z from "zod";
import { ErrorMessage } from "../../utils/errorMessage";
import {
  buildPlannerRequestBody,
  createFallbackVoicePlan,
  extractPlannerResponseText,
  getVoicePlannerProvider,
  normalizeVoicePlan,
} from "./planner";

export const router = express.Router();

const voicePlanRequestSchema = z.object({
  transcript: z.string().trim().min(1),
  workflowId: z.string().optional(),
});

async function requestVoicePlan(transcript: string) {
  const provider = getVoicePlannerProvider();
  const body = buildPlannerRequestBody(provider, transcript);

  const response = await fetch(provider.baseUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${provider.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`planner request failed: ${response.status} ${body}`);
  }

  const payload = await response.json();
  const text = extractPlannerResponseText(payload);
  try {
    return normalizeVoicePlan(JSON.parse(text));
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof z.ZodError) {
      return createFallbackVoicePlan(transcript);
    }
    throw error;
  }
}

router.post("/plan", async (req, res) => {
  const { data, success } = voicePlanRequestSchema.safeParse(req.body);
  if (!success) {
    return res
      .status(400)
      .json({ success: false, error: ErrorMessage.PARSING });
  }

  try {
    const plan = await requestVoicePlan(data.transcript);
    return res.json({ success: true, data: plan });
  } catch (error) {
    const isValidationError = error instanceof z.ZodError;
    const status =
      (error as Error & { status?: number }).status ??
      (isValidationError ? 422 : 500);
    return res.status(status).json({
      success: false,
      error: isValidationError
        ? "Voice planner returned an invalid draft. Try again with a simpler workflow."
        : error instanceof Error
          ? error.message
          : "voice planning failed",
    });
  }
});
