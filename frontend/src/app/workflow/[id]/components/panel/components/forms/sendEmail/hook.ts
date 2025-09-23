import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { api } from "@/lib/utils";
import { toast } from "sonner";
import { ApiCredential } from "@/lib/types/credential";

export function useGetUserGoogleAccounts() {
  const { data }: UseQueryResult<ApiCredential[], Error> = useQuery({
    queryKey: ["user-google-account"],
    queryFn: async () => {
      const { data } = await api.get("/accounts/gmail/list");
      if (!data.success) {
        toast.error("error loading google accounts");
        return [];
      }
      return data.data.accounts;
    },
  });
  return data;
}
