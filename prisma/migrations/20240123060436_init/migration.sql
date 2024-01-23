-- CreateTable
CREATE TABLE "LeetcodeQuestion" (
    "year" INTEGER NOT NULL DEFAULT 2024,
    "month" INTEGER NOT NULL DEFAULT 1,
    "day" INTEGER NOT NULL DEFAULT 1,
    "frontend_id" INTEGER NOT NULL DEFAULT 1,
    "problem_name" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "LeetcodeQuestion_pkey" PRIMARY KEY ("frontend_id")
);
