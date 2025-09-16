import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <Button>
      <Link href="/workflow/123">hello world</Link>
    </Button>
  );
}
