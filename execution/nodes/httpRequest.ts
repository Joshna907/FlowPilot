import axios from "axios";
import { buildHttpRequestExecution } from "./httpRequestConfig";

export { buildHttpRequestExecution } from "./httpRequestConfig";

export async function executeHttpRequest(metadata: Record<string, unknown>) {
  const { endpoint, payload, headers, method } =
    buildHttpRequestExecution(metadata);
  const response = await axios.request({
    url: endpoint,
    method,
    data: payload,
    headers,
  });
  return { body: response.data, status: response.status };
}
