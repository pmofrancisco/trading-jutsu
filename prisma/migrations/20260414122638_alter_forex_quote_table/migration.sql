/*
  Warnings:

  - You are about to drop the column `timestamp` on the `ForexQuote` table. All the data in the column will be lost.
  - Added the required column `quoteDate` to the `ForexQuote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ForexQuote" DROP COLUMN "timestamp",
ADD COLUMN     "quoteDate" TIMESTAMP(3) NOT NULL;
