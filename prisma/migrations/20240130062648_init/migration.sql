-- CreateTable
CREATE TABLE "ProblemSetEntry" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL DEFAULT 2024,
    "month" INTEGER NOT NULL DEFAULT 1,
    "day" INTEGER NOT NULL DEFAULT 1,
    "content" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "ProblemSetEntry_pkey" PRIMARY KEY ("id")
);
