/*
  Warnings:

  - The `metadata` column on the `Node` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Node" DROP COLUMN "metadata",
ADD COLUMN     "metadata" JSONB;
