import TelegramBot from 'node-telegram-bot-api';
import type { Message } from 'node-telegram-bot-api';

import { PrismaClient } from '@prisma/client'

import { module as leetcode_module } from './lib/leetcode/index';
import { Stream } from './lib/util/stream';

const prisma = new PrismaClient();

const token = process.env.TELEGRAM_BOT_TOKEN || 'default_token';
const bot = new TelegramBot(token, { polling: true });

console.log('up and running');

bot.onText(/\/start/, async (msg: Message) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hello! I am your event-tracking bot.');
});

// handles leetcode submission links
bot.onText(leetcode_module.filter_regex, async (msg: Message) => {
  const stream = new Stream(bot, msg);
  try {
    await leetcode_module.entry_point(prisma, stream, msg);
  } catch (e) {
    stream.append(
      `The input seems to be ${leetcode_module.input}, `
      + `but the following error occurred during handling it:`
      + `\n\n${e}\n\n`
      + `Please let Owen know about this.`
    );
  }
  await stream.fire();
});

bot.onText(/\/stat/, async (msg: Message) => {
  const all_submissions = await prisma.leetcodeSubmission.findMany()

  await bot.sendMessage(msg.chat.id, `You have ${all_submissions.length} submissions recorded:\n`
    + all_submissions.map((b) => `*${b.problem_name}* on ${b.year}/${b.month}/${b.day} with `
      + `submission id _${b.submission_id}_;`).join('\n'), { parse_mode: "Markdown" })
});

bot.onText(/\/drop_everything/, async (msg: Message) => {
  const send = await bot.sendMessage(msg.chat.id, `Are you sure to drop all data?`);
  bot.onReplyToMessage(send.chat.id, send.message_id, async (reply_msg: Message) => {
    if (reply_msg.text === 'yes') {
      await prisma.leetcodeSubmission.deleteMany({});
      await bot.sendMessage(reply_msg.chat.id, 'All cleaned up!');
    } else {
      await bot.sendMessage(reply_msg.chat.id, 'Phew scared the sh\*t out of me.');
    }
  })
});