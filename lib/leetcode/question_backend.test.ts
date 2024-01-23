import { expect, test, beforeEach, beforeAll, afterAll, spyOn } from "bun:test";
import { PrismaClient } from "@prisma/client";
import { fetch_leetcode_daily_challenges_in, get_questions_or_fetch, type Question } from "./question_backend";
import * as question_backend from './question_backend';
import { has_database } from "../util";

let prisma: PrismaClient;

beforeAll(async () => {
  if (!has_database()) {
    return;
  }
  prisma = new PrismaClient();
  await prisma.leetcodeQuestion.deleteMany({});
  const remaining = await prisma.leetcodeQuestion.findMany({});
  expect(remaining.length).toEqual(0);
})

test('fetch the correct challenge on Dec 1, 2023', async () => {
  const challenges = await fetch_leetcode_daily_challenges_in(2023, 12);
  const challenge = challenges.find(challenge => challenge.day === 1);

  expect(challenge).toEqual({
    year: 2023,
    month: 12,
    day: 1,
    frontend_id: 1662,
    problem_name: 'check-if-two-string-arrays-are-equivalent',
  })
});

test.if(has_database())('fetch a few challenges without the need to bother internet every time', async () => {
  const q1: Question = { year: 2024, month: 1, day: 11, frontend_id: 1026, problem_name: 'maximum-difference-between-node-and-ancestor' };
  const q2: Question = { year: 2024, month: 1, day: 15, frontend_id: 2225, problem_name: 'find-players-with-zero-or-one-losses' };
  const q3: Question = { year: 2023, month: 11, day: 7, frontend_id: 1921, problem_name: 'eliminate-maximum-number-of-monsters' };
  const q4: Question = { year: 2023, month: 11, day: 30, frontend_id: 1611, problem_name: 'minimum-one-bit-operations-to-make-integers-zero' };

  const spy = spyOn(question_backend, 'fetch_leetcode_daily_challenges_in');
  spy.mockClear();
  expect(spy).toHaveBeenCalledTimes(0);
  const jan_questions = await get_questions_or_fetch(prisma, 2024, 1);
  expect(spy).toHaveBeenCalledTimes(1);
  const jan_questions_second = await get_questions_or_fetch(prisma, 2024, 1);
  expect(spy).toHaveBeenCalledTimes(1);
  expect(jan_questions).toEqual(jan_questions_second);
  expect(jan_questions).toEqual(expect.arrayContaining([q1, q2]));

  const nov_questions = await get_questions_or_fetch(prisma, 2023, 11);
  expect(spy).toHaveBeenCalledTimes(2);
  const nov_questions_second = await get_questions_or_fetch(prisma, 2023, 11);
  expect(spy).toHaveBeenCalledTimes(2);
  expect(nov_questions).toEqual(nov_questions_second);
  expect(nov_questions).toEqual(expect.arrayContaining([q3, q4]));
});

afterAll(async () => {
  if (has_database()) { await prisma.$disconnect(); }
})