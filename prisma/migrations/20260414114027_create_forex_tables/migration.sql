-- CreateTable
CREATE TABLE "ForexCurrencyPair" (
    "id" SERIAL NOT NULL,
    "baseCurrency" TEXT NOT NULL,
    "quoteCurrency" TEXT NOT NULL,

    CONSTRAINT "ForexCurrencyPair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForexQuote" (
    "id" SERIAL NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "pairId" INTEGER NOT NULL,

    CONSTRAINT "ForexQuote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ForexQuote" ADD CONSTRAINT "ForexQuote_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "ForexCurrencyPair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
