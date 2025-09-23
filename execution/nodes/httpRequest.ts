import z from "zod";
import axios from "axios";

const httpRequestMeadataSchema = z.object({ endpoint: z.string() });

export async function executeHttpRequest(metadata: Record<string, unknown>) {
  const { data, success } = httpRequestMeadataSchema.safeParse(metadata);
  if (!success) {
    throw "unable to parse httpRequest data";
  }
  const { endpoint } = data;
  const { data: body } = await axios.get(endpoint);
  return { body };
}
