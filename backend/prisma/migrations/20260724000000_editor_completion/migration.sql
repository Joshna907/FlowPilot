ALTER TYPE "public"."NodeType" ADD VALUE 'DELAY';
ALTER TYPE "public"."NodeType" ADD VALUE 'FILTER';

ALTER TYPE "public"."CredentialType" ADD VALUE 'SLACK_WEBHOOK';
ALTER TYPE "public"."CredentialType" ADD VALUE 'DISCORD_WEBHOOK';
ALTER TYPE "public"."CredentialType" ADD VALUE 'WHATSAPP_CLOUD';

ALTER TABLE "public"."Workflow" ADD COLUMN "publishedAt" TIMESTAMP(3);
