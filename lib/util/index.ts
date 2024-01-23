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