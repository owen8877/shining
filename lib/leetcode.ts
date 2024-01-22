import { PrismaClient } from '@prisma/client'

export class ParseFailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseFailError';
  }
}

export interface LeetcodeSubmissionBean {
  problem_name: string;
  submission_id: number;
  year: number;
  month: number;
  day: number;
}

export function parse_link(link: string): LeetcodeSubmissionBean {
  const regex = /\/problems\/([^\/]+)\/submissions\/(\d+)\//;
  const regex_ext = /envId=(\d{4})-(\d{2})-(\d{2})/;

  const match = link.match(regex);

  if (match) {
    const [_, problem_name, submission_id_str] = match;
    const submission_id = parseInt(submission_id_str) || 0;

    const { year_str, month_str, day_str } = (() => {
      const match_ext = link.match(regex_ext);

      if (match_ext) {
        const [_, year_str, month_str, day_str] = match_ext;
        return { year_str, month_str, day_str };
      } else {
        const currentDate = new Date();
        const options = { timeZone: process.env.TZ ?? 'UTC' };
        const year_str = new Intl.DateTimeFormat(undefined, { year: 'numeric', ...options }).format(currentDate);
        const month_str = new Intl.DateTimeFormat(undefined, { month: 'numeric', ...options }).format(currentDate);
        const day_str = new Intl.DateTimeFormat(undefined, { day: 'numeric', ...options }).format(currentDate);
        return { year_str, month_str, day_str };
      }
    })();

    const year = parseInt(year_str) || 0;
    const month = parseInt(month_str) || 0;
    const day = parseInt(day_str) || 0;
    return { problem_name, submission_id, year, month, day };
  } else {
    throw new ParseFailError(`Cannot extract problem name and submission id from argument "${link}".`);
  }
}

export async function insert_if_no_duplicate(prisma: PrismaClient, submission: LeetcodeSubmissionBean): Promise<boolean> {
  // return true if there is no duplicate
  const collision = await prisma.leetcodeSubmission.findFirst({ where: submission });
  if (collision) {
    return false;
  } else {
    // can safely insert
    const b_record = await prisma.leetcodeSubmission.create({ data: submission });
    return true;
  }
}