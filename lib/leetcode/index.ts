import { PrismaClient } from '@prisma/client'
import type { Stream } from '../util/stream';
import type { Message } from 'node-telegram-bot-api';
import { get_questions_or_fetch } from './question_backend';
import type { BotModule } from '../util';

export class ParseFailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseFailError';
  }
}

interface ProblemNameIdBean {
  problem_name: string;
  submission_id: number;
}

interface DateBean {
  year: number;
  month: number;
  day: number;
}

interface LeetcodeSubmissionBean {
  problem_name: string;
  submission_id: number;
  year: number;
  month: number;
  day: number;
}

export function parse_link(link: string): [ProblemNameIdBean, DateBean?] {
  const regex = /\/problems\/([^\/]+)\/submissions\/(\d+)\//;
  const regex_ext = /envId=(\d{4})-(\d{2})-(\d{2})/;

  const match = link.match(regex);

  if (match) {
    const [_, problem_name, submission_id_str] = match;
    const submission_id = parseInt(submission_id_str) || 0;
    const problem_name_id_bean = { problem_name, submission_id };

    const match_ext = link.match(regex_ext);

    if (match_ext) {
      const [_, year_str, month_str, day_str] = match_ext;
      const year = parseInt(year_str) || 0;
      const month = parseInt(month_str) || 0;
      const day = parseInt(day_str) || 0;
      return [problem_name_id_bean, { year, month, day }];
    } else {
      // @Deprecated; old method that takes the current date as the date for the problem.
      // const currentDate = new Date();
      // const options = { timeZone: process.env.TZ ?? 'UTC' };
      // const year_str = new Intl.DateTimeFormat(undefined, { year: 'numeric', ...options }).format(currentDate);
      // const month_str = new Intl.DateTimeFormat(undefined, { month: 'numeric', ...options }).format(currentDate);
      // const day_str = new Intl.DateTimeFormat(undefined, { day: 'numeric', ...options }).format(currentDate);
      // const year = parseInt(year_str) || 0;
      // const month = parseInt(month_str) || 0;
      // const day = parseInt(day_str) || 0;
      // return [problem_name_id_bean, { year, month, day }];

      // New way: look up the existing database and check which date it belongs to
      return [problem_name_id_bean, undefined];
    }
  } else {
    throw new ParseFailError(`Cannot extract problem name and submission id from argument "${link}".`);
  }
}

export async function lookup_leetcode_date_based_on_problem_name(
  prisma: PrismaClient, problem_bean: ProblemNameIdBean, date_bean: DateBean | undefined
): Promise<DateBean> {
  if (date_bean === undefined) {
    // The date information cannot be inferred from the url; we must trace back and find the correct one.

    let [retry, current_year, current_month] = [0, (new Date()).getFullYear(), (new Date()).getMonth() + 1];
    const MAX_RETRY = 12;
    while (retry < MAX_RETRY) {
      // Try to find the problem in a previous month, within a year
      const questions = await get_questions_or_fetch(prisma, current_year, current_month);
      const question_of_interest = questions.find(question => question.problem_name == problem_bean.problem_name);
      if (question_of_interest) {
        return { year: current_year, month: current_month, day: question_of_interest.day };
      }

      // Didn't find the desired problem
      retry += 1;
      current_month -= 1;
      if (current_month <= 0) {
        current_year -= 1;
        current_month += 12;
      }
    }
    throw new Error(`Cannot find a leetcode question with name ${problem_bean.problem_name} within the past year!`);
  } else {
    return date_bean;
  }
}

export async function insert_if_no_duplicate(prisma: PrismaClient, submission: LeetcodeSubmissionBean): Promise<boolean> {
  // return true if there is no duplicate
  const collision = await prisma.leetcodeSubmission.findFirst({ where: submission });
  if (collision) {
    return false;
  } else {
    // can safely insert
    await prisma.leetcodeSubmission.create({ data: submission });
    return true;
  }
}

async function entry_point(prisma: PrismaClient, stream: Stream, msg: Message): Promise<void> {
  const [problem_bean, date_bean] = parse_link(msg.text ?? '');
  const date_clean_bean = await lookup_leetcode_date_based_on_problem_name(prisma, problem_bean, date_bean);
  const b = { ...problem_bean, ...date_clean_bean };
  const no_duplicate = await insert_if_no_duplicate(prisma, b);
  if (no_duplicate) {
    const reply = `Thanks for the submission, `
      + `You did *${b.problem_name}* on ${b.year}/${b.month}/${b.day} with `
      + `submission id _${b.submission_id}_,`;
    stream.append(reply);
  } else {
    stream.append('Oops! Looks like we have added this submission before.');
  }
}

export const module: BotModule = {
  input: 'a link to the leetcode website',
  filter_regex: /leetcode\.com/,
  entry_point,
}