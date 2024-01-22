// @Deprecated

import { test, expect, spyOn } from 'bun:test';
import { load_env_file } from './env';
import * as env_module from './env';
import { get_random_int, get_random_string, py_range } from './test_util';

test('a random .env file can loaded correctly', async () => {
  return;

  const n_lines = get_random_int(10) + 1;
  const random_env_list = py_range(n_lines)
    .map((_) => [get_random_string(4).toUpperCase(), get_random_string(10).toLowerCase()]);
  const random_env_obj = Object.fromEntries(random_env_list);

  const read_from_external_mock = spyOn(env_module, 'read_from_external').mockImplementation(async (_: string) => {
    return Object.entries(random_env_obj).map(([key, value]) => `${key}=${value}`).join('\n');
  });

  const test_output = await load_env_file(get_random_string(10));

  expect(read_from_external_mock).toHaveBeenCalledTimes(1);
  expect(test_output).toEqual(random_env_obj);
});