import { Button } from "@/components/ui/button";
import { api } from "@/lib/utils";

async function initGoogleOAuth() {
  const url = `${process.env.NEXT_PUBLIC_API_BASE}/auth/google/init`;
  const { data } = await api.get(url);
  return (window.location.href = data.url);
}

export function SendEmailAndAwaitReply() {
  return <Button onClick={initGoogleOAuth}>+</Button>;
}
