import type { PrismaClient } from "@prisma/client";

interface QuestionBean {
  questionFrontendId: string;  // "1662"
  title: string;  // "Check If Two String Arrays are Equivalent"
  titleSlug: string;  // "check-if-two-string-arrays-are-equivalent"
}

interface ChallengeBean {
  date: string;  // "2023-12-01"
  userStatus: string;  // "NotStart"
  link: string;  // "/problems/check-if-two-string-arrays-are-equivalent/"
  question: QuestionBean;
}

export interface Question {
  year: number;
  month: number;
  day: number;
  frontend_id: number;
  problem_name: string;
}

export async function fetch_leetcode_daily_challenges_in(year: number, month: number): Promise<Question[]> {
  const response = await fetch("https://leetcode.com/graphql/", {
    "credentials": "include",
    "headers": {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
      "Accept": "*/*",
      "Accept-Language": "en-US",
      "content-type": "application/json",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin"
    },
    "referrer": "https://leetcode.com/problemset/",
    "body": `{\"query\":\"\\n    query dailyCodingQuestionRecords($year: Int!, $month: Int!) {\\n  dailyCodingChallengeV2(year: $year, month: $month) {\\n    challenges {\\n      date\\n      userStatus\\n      link\\n      question {\\n        questionFrontendId\\n        title\\n        titleSlug\\n      }\\n    }\\n    weeklyChallenges {\\n      date\\n      userStatus\\n      link\\n      question {\\n        questionFrontendId\\n        title\\n        titleSlug\\n        isPaidOnly\\n      }\\n    }\\n  }\\n}\\n    \",\"variables\":{\"year\":${year},\"month\":${month}},\"operationName\":\"dailyCodingQuestionRecords\"}`,
    "method": "POST",
    "mode": "cors"
  });
  const data = await response.json() as { data: { dailyCodingChallengeV2: { challenges: ChallengeBean[] } } };
  const challenges = data.data.dailyCodingChallengeV2.challenges;
  return challenges.map((challenge) => {
    const { date, question: question_bean } = challenge;
    const { questionFrontendId, titleSlug: problem_name } = question_bean;
    const year = parseInt(date.slice(0, 4)) || 0;
    const month = parseInt(date.slice(5, 7)) || 0;
    const day = parseInt(date.slice(8, 10)) || 0;
    return { year, month, day, frontend_id: parseInt(questionFrontendId) || 0, problem_name };
  });
}

export async function get_questions_or_fetch(prisma: PrismaClient, year: number, month: number) {
  const exist_one = await prisma.leetcodeQuestion.findFirst({ where: { year, month } });
  if (!exist_one) {
    // In great trouble since there is no entry in cache.
    const questions = await fetch_leetcode_daily_challenges_in(year, month);
    await prisma.leetcodeQuestion.createMany({ data: questions });
  }
  return await prisma.leetcodeQuestion.findMany({ where: { year, month }, orderBy: { day: 'desc' } });
}