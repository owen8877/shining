import { expect, test } from "bun:test";
import { parse_link } from "./leetcode";

function get_random_string(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}


function generate_good_cases(n: number) {
  return [...Array(n).keys()].map(() => [
    get_random_string(15),  // problem_name
    Math.floor(Math.random() * 1000),  // submission_id
    Math.floor(Math.random() * 4) + 2019,  // year
    Math.floor(Math.random() * 11) + 1,  // month
    Math.floor(Math.random() * 28) + 1,  // day
    true,  // good_case
  ]);
}

function generate_bad_cases(n: number) {
  return [...Array(n).keys()].map(() => [
    '',  // problem_name
    Math.floor(Math.random() * 1000),  // submission_id
    Math.floor(Math.random() * 4) + 2019,  // year
    Math.floor(Math.random() * 11) + 1,  // month
    Math.floor(Math.random() * 28) + 1,  // day
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
      throw new Error('Should not fail on a good case!');
    }
  }
})

// Test `determine_if_duplicate`
test.todo(`determine_if_duplicate`)