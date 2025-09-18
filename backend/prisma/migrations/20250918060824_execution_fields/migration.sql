/*
  Warnings:

  - The `output` column on the `Execution` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `status` on the `Execution` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."ExecutionStatus" AS ENUM ('QUEUED', 'PROCESSING', 'SUCCEEDED', 'FAILED');

-- AlterTable
ALTER TABLE "public"."Execution" DROP COLUMN "status",
ADD COLUMN     "status" "public"."ExecutionStatus" NOT NULL,
DROP COLUMN "output",
ADD COLUMN     "output" JSONB;

-- CreateIndex
CREATE INDEX "Execution_status_idx" ON "public"."Execution"("status");
