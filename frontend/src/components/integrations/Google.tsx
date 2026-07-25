import { Button } from "@/components/ui/button";
import { api } from "@/lib/utils";
import { Chrome } from "lucide-react";

async function initGoogleOAuth() {
  const url = `${process.env.NEXT_PUBLIC_API_BASE}/auth/google/init`;
  const { data } = await api.get(url);
  return (window.location.href = data.url);
}

export function GoogleIntegration() {
  return (
    <Button onClick={initGoogleOAuth} variant="outline">
      <Chrome />
      Connect Google
    </Button>
  );
}
