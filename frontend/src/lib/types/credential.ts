export enum CredentialType {
  GMAIL = "GMAIL",
}

export type ApiCredential = {
  id: string;
  userId: string;
  credentialType: CredentialType;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};
