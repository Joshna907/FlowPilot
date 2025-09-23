import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { api } from "@/lib/utils";
import { toast } from "sonner";
import { ApiCredential, CredentialType } from "@/lib/types/credential";

export function useGetUserEmailCredentials() {
  const { data }: UseQueryResult<ApiCredential[], Error> = useQuery({
    queryKey: ["user-email-credentials"],
    queryFn: async () => {
      const { data } = await api.post("/credential/list", {
        filter: {
          credentialType: CredentialType.GMAIL,
        },
      });
      if (!data.success) {
        toast.error("error loading credentials");
        return [];
      }
      return data.data.credentials;
    },
  });
  return data;
}
