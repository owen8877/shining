import { PrismaClient } from '@prisma/client'
import type { Stream } from '../util/stream';
import { get_year_month_day, type BotModule } from '../util'
import type { Message } from 'node-telegram-bot-api';

const filter_regex = /((?:刷了|刷完了|刷到了|做了|做好了|做完了|做上了|完成了))(.*)/;
async function entry_point(prisma: PrismaClient, stream: Stream, msg: Message): Promise<void> {
  const match = (msg.text ?? '').match(filter_regex);
  if (match) {
    const trigger = match[1];
    const content = match[2];

    let offset = 0;
    if ((msg.text ?? '').match(/前天/)) {
      offset = 2;
    }
    if ((msg.text ?? '').match(/昨天/)) {
      offset = 1;
    }

    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
    const { year, month, day } = get_year_month_day(new Date((new Date()).getTime() - oneDayInMilliseconds * offset));

    await prisma.problemSetEntry.create({ data: { year, month, day, content } });

    stream.append(`Good! You have ${trigger} ${content} (offset=${offset}) which has been saved to database!`)
  } else {
    throw new Error(`Cannot match input ${msg.text}!`);
  }
}

export const module: BotModule = {
  input: 'which problem Leon has solved today',
  filter_regex,
  entry_point,
}