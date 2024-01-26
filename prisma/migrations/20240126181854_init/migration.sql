-- CreateTable
CREATE TABLE "StudyEntry" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "StudyEntry_pkey" PRIMARY KEY ("id")
);
