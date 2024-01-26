import type { PrismaClient } from "@prisma/client";
import type { Stream } from "./stream";
import type { Message } from "node-telegram-bot-api";

export function get_random_string(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}

export function get_random_int(high: number): number;
export function get_random_int(low: number, high: number): number;
export function get_random_int(arg1: number, arg2?: number): number {
  if (arg2 === undefined) {
    const high = arg1;
    return Math.floor(Math.random() * high);
  } else {
    const low = arg1;
    const diff = arg2 - arg1;
    return Math.floor(Math.random() * diff) + low;
  }
}

export function py_range(stop: number): number[];
export function py_range(start: number, stop: number): number[];
export function py_range(arg1: number, arg2?: number): number[] {
  if (arg2 === undefined) {
    const stop = arg1;
    return [...Array(stop).keys()];
  } else {
    const start = arg1;
    const len = arg2 - arg1;
    return [...Array(len).keys()].map(x => x + start);
  }
}

export function has_database(): boolean {
  if (process.env.NO_DATABASE) {
    return false;
  }
  return true
}

export interface BotModule {
  input: string,
  filter_regex: RegExp,
  entry_point(prisma: PrismaClient, stream: Stream, msg: Message): Promise<void>,
}

export function get_year_month_day(date?: Date): {year: number, month: number, day: number} {
  if (date === undefined) {
    date = new Date();
  }
  const options = { timeZone: process.env.TZ ?? 'UTC' };
  const year_str = new Intl.DateTimeFormat(undefined, { year: 'numeric', ...options }).format(date);
  const month_str = new Intl.DateTimeFormat(undefined, { month: 'numeric', ...options }).format(date);
  const day_str = new Intl.DateTimeFormat(undefined, { day: 'numeric', ...options }).format(date);
  const year = parseInt(year_str) || 0;
  const month = parseInt(month_str) || 0;
  const day = parseInt(day_str) || 0;
  return { year, month, day };
}
