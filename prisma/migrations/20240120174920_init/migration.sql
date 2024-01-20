-- CreateTable
CREATE TABLE "LeetcodeSubmission" (
    "id" SERIAL NOT NULL,
    "problem_name" TEXT NOT NULL DEFAULT '',
    "submission_id" INTEGER NOT NULL DEFAULT 0,
    "year" INTEGER NOT NULL DEFAULT 2024,
    "month" INTEGER NOT NULL DEFAULT 1,
    "day" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "LeetcodeSubmission_pkey" PRIMARY KEY ("id")
);
