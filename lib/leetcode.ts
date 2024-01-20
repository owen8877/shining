export class ParseFailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseFailError';
  }
}

export function parse_link(link: string): { problem_name: string, submission_id: number, year: number, month: number, day: number } {
  const regex = /\/problems\/([^\/]+)\/submissions\/(\d+)\/\?.*envId=(\d{4})-(\d{2})-(\d{2})/;

  const match = link.match(regex);

  if (match) {
    const [_, problem_name, submission_id_str, year_str, month_str, day_str] = match;
    const submission_id = parseInt(submission_id_str) || 0;
    const year = parseInt(year_str) || 0;
    const month = parseInt(month_str) || 0;
    const day = parseInt(day_str) || 0;

    return { problem_name, submission_id, year, month, day };
  } else {
    throw new ParseFailError(`Argument ${link} cannot be parsed!`);
  }
}