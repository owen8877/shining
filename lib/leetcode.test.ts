import { expect, test } from "bun:test";
import { ParseFailError, parse_link } from "./leetcode";
import { get_random_int, get_random_string, py_range } from "./test_util";

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
    const parsed = parse_link(link);
    if (good_case) {
      expect(preset.problem_name).toBe(parsed.problem_name);
      expect(preset.submission_id).toBe(parsed.submission_id);
      expect(preset.year).toBe(parsed.year);
      expect(preset.month).toBe(parsed.month);
      expect(preset.day).toBe(parsed.day);
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
    const parsed = parse_link(link);
    if (good_case) {
      expect(preset.problem_name).toBe(parsed.problem_name);
      expect(preset.submission_id).toBe(parsed.submission_id);
      expect(preset.year).toBe(parsed.year);
      expect(preset.month).toBe(parsed.month);
      expect(preset.day).toBe(parsed.day);
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

function setSystemTime(arg0: Date) {
  throw new Error("Function not implemented.");
}
