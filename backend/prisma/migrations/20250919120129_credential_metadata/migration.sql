/*
  Warnings:

  - Changed the type of `metadata` on the `Credential` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Credential" DROP COLUMN "metadata",
ADD COLUMN     "metadata" JSONB NOT NULL;
