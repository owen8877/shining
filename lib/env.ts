// @Deprecated
// Simply reads environmental variables

import { promises as fsPromises } from 'fs';

// TODO
interface FileReadError extends NodeJS.ErrnoException {
  code: string;
}

export async function read_from_external(filePath: string): Promise<string | null> {
  try {
    // Check if the file exists by trying to access its stats
    await fsPromises.access(filePath);

    // If access is successful, read the file
    const fileContent = await fsPromises.readFile(filePath, 'utf-8');
    return fileContent;
  } catch (error) {
    const fileReadError = error as FileReadError;
    if (fileReadError.code === 'ENOENT') {
      // File doesn't exist
      return null;
    } else {
      // Other error, handle accordingly
      throw error;
    }
  }
}

export async function load_env_file(filePath: string): Promise<object> {
  const data = await read_from_external(filePath);
  if (data === null) {
    return {};
  }
  const lines = data.split('\n');

  const key_value_pairs = lines
    .map(line => line.trim())
    .filter(trimmedLine => (trimmedLine && !trimmedLine.startsWith('#')))
    .map(trimmedLine => trimmedLine.split('='));

  return Object.fromEntries(key_value_pairs);
}

export const ENV = {
  ...{
    timeZone: 'UTC',
  },
  ...await load_env_file('.env'),
}