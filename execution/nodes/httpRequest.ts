import z from "zod";
import axios from "axios";

const httpRequestMeadataSchema = z.object({
  endpoint: z.string(),
  body: z.string().optional(),
});

export async function executeHttpRequest(metadata: Record<string, unknown>) {
  const { data, success } = httpRequestMeadataSchema.safeParse(metadata);
  if (!success) {
    throw "unable to parse httpRequest data";
  }
  const { endpoint, body } = data;

  let payload: unknown = body;
  let headers: Record<string, string> = {};
  if (body) {
    try {
      payload = JSON.parse(body);
      headers["content-type"] = "application/json";
    } catch {
      headers["content-type"] = "text/plain";
      payload = body;
    }
  }
  const response = await axios.post(endpoint, payload, { headers });
  return { body: response.data, status: response.status };
}
