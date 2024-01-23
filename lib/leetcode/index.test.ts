import { expect, test, beforeAll, afterAll, spyOn } from "bun:test";
import { ParseFailError, lookup_leetcode_date_based_on_problem_name, parse_link } from ".";
import { PrismaClient } from "@prisma/client";
import { get_random_int, get_random_string, py_range, has_database } from "../util";
import type { Question } from "./question_backend";
import * as question_backend from './question_backend';

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

function generate_good_cases(n: number) {
  return py_range(n).map(() => [
    get_random_string(15),  // problem_name
    get_random_int(1000),  // submission_id
    get_random_int(2019, 2023),  // year
    get_random_int(1, 13),  // month
    get_random_int(1, 29),  // day
    true,  // good_case
  ]);
}

function generate_bad_cases(n: number) {
  return py_range(n).map(() => [
    '',  // problem_name
    get_random_int(1000),  // submission_id
    get_random_int(2019, 2023),  // year
    get_random_int(1, 13),  // month
    get_random_int(1, 29),  // day
    false,  // good_case
  ]);
}

const parse_link_cases = [...generate_good_cases(5), ...generate_bad_cases(5)];

test.each(parse_link_cases)('parse link using %p, %p, %p/%p/%p, expecting %p', (problem_name, submission_id, year, month, day, good_case) => {
  const preset = { problem_name, submission_id, year, month, day };

  const month_padded = month.toString().padStart(2, '0');
  const day_padded = day.toString().padStart(2, '0');

  const link = `https://leetcode.com/problems/${problem_name}`
    + `/submissions/${submission_id}`
    + `/?envType=daily-question&envId=${year}-${month_padded}-${day_padded}`;

  try {
    const [parsed_problem_bean, parse_date_bean] = parse_link(link);
    if (good_case) {
      expect(preset.problem_name).toBe(parsed_problem_bean.problem_name);
      expect(preset.submission_id).toBe(parsed_problem_bean.submission_id);
      expect(preset.year).toBe(parse_date_bean?.year || 0);
      expect(preset.month).toBe(parse_date_bean?.month || 0);
      expect(preset.day).toBe(parse_date_bean?.day || 0);
    } else {
      throw new Error('Should have failed on a bad case!');
    }
  } catch (e) {
    if (good_case) {
      throw new Error(`Should not fail on a good case! Look at error ${e}.`);
    }
    if (!good_case && !(e instanceof ParseFailError)) {
      throw new Error(`Unknown error occured in a bad case: ${e}.`)
    }
  }
})

function setSystemTime(arg0: Date) {
  throw new Error("Function not implemented.");
}

test.each(parse_link_cases)('parse link using %p, %p but date (%p/%p/%p) explicitly determined, expecting %p', (problem_name, submission_id, year, month, day, good_case) => {
  // TODO: bun test runner does not support date change at the moment, skipping
  return

  const preset = { problem_name, submission_id, year, month, day };

  setSystemTime(new Date(year as number, month as number - 1, day as number,
    get_random_int(1, 24), get_random_int(60), get_random_int(60)));

  const link = `https://leetcode.com/problems/${problem_name}`
    + `/submissions/${submission_id}`
    + `/?lang=python`;

  try {
    const [parsed_problem_bean, parse_date_bean] = parse_link(link);
    if (good_case) {
      expect(preset.problem_name).toBe(parsed_problem_bean.problem_name);
      expect(preset.submission_id).toBe(parsed_problem_bean.submission_id);
      expect(preset.year).toBe(parse_date_bean?.year || 0);
      expect(preset.month).toBe(parse_date_bean?.month || 0);
      expect(preset.day).toBe(parse_date_bean?.day || 0);
    } else {
      throw new Error('Should have failed on a bad case!');
    }
  } catch (e) {
    if (good_case) {
      throw new Error(`Should not fail on a good case! Look at error ${e}.`);
    }
    if (!good_case && !(e instanceof ParseFailError)) {
      throw new Error(`Unknown error occured in a bad case: ${e}.`)
    }
  }
})

// Test `determine_if_duplicate`
test.todo(`determine_if_duplicate`)

test.if(has_database())('check if lookup by name is working', async () => {
  const q1: Question = { year: 2024, month: 1, day: 11, frontend_id: 1026, problem_name: 'maximum-difference-between-node-and-ancestor' };
  const q2: Question = { year: 2024, month: 1, day: 15, frontend_id: 2225, problem_name: 'find-players-with-zero-or-one-losses' };
  const q3: Question = { year: 2023, month: 11, day: 7, frontend_id: 1921, problem_name: 'eliminate-maximum-number-of-monsters' };
  const q4: Question = { year: 2023, month: 11, day: 30, frontend_id: 1611, problem_name: 'minimum-one-bit-operations-to-make-integers-zero' };

  const spy = spyOn(question_backend, 'fetch_leetcode_daily_challenges_in');

  expect(spy).toHaveBeenCalledTimes(0);
  const q1_lookup_date_bean = await lookup_leetcode_date_based_on_problem_name(prisma,
    { problem_name: q1.problem_name, submission_id: 123 }, undefined);
  expect(spy).toHaveBeenCalledTimes(1);  // May fail depending on which month the test is runned!
  const q2_lookup_date_bean = await lookup_leetcode_date_based_on_problem_name(prisma,
    { problem_name: q2.problem_name, submission_id: 123 }, undefined);
  expect(spy).toHaveBeenCalledTimes(1);
  expect(q1_lookup_date_bean).toEqual({ year: q1.year, month: q1.month, day: q1.day });
  expect(q2_lookup_date_bean).toEqual({ year: q2.year, month: q2.month, day: q2.day });

  const q3_lookup_date_bean = await lookup_leetcode_date_based_on_problem_name(prisma,
    { problem_name: q3.problem_name, submission_id: 123 }, undefined);
  expect(spy).toHaveBeenCalledTimes(3);
  const q4_lookup_date_bean = await lookup_leetcode_date_based_on_problem_name(prisma,
    { problem_name: q4.problem_name, submission_id: 123 }, undefined);
  expect(spy).toHaveBeenCalledTimes(3);
  expect(q3_lookup_date_bean).toEqual({ year: q3.year, month: q3.month, day: q3.day });
  expect(q4_lookup_date_bean).toEqual({ year: q4.year, month: q4.month, day: q4.day });
})

afterAll(async () => {
  if (has_database()) { await prisma.$disconnect(); }
})