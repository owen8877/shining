import TelegramBot from 'node-telegram-bot-api';
import type { Message } from 'node-telegram-bot-api';

import { PrismaClient } from '@prisma/client'

import { module as leetcode_module } from './lib/leetcode/index';
import { module as study_module } from './lib/study/index';
import { module as problem_set_module } from './lib/problem_set/index';
import { Stream } from './lib/util/stream';

const prisma = new PrismaClient();

const token = process.env.TELEGRAM_BOT_TOKEN || 'default_token';
const bot = new TelegramBot(token, { polling: true });

console.log('up and running');

bot.onText(/\/start/, async (msg: Message) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hello! I am your event-tracking bot.');
});

for (let m of [leetcode_module, study_module, problem_set_module]) {
  bot.onText(m.filter_regex, async (msg: Message) => {
    const stream = new Stream(bot, msg);
    try {
      await m.entry_point(prisma, stream, msg);
    } catch (e) {
      stream.append(
        `The input seems to be ${m.input}, `
        + `but the following error occurred during handling it:`
        + `\n\n${e}\n\n`
        + `Please let Owen know about this.`
      );
    }
    await stream.fire();
  });
}

bot.onText(/\/stat/, async (msg: Message) => {
  const all_submissions = await prisma.leetcodeSubmission.findMany();  // TODO: migreate year/month/day to date
  const all_studies = await prisma.studyEntry.findMany();
  const all_problem_sets = await prisma.problemSetEntry.findMany();

  await bot.sendMessage(msg.chat.id, `You have ${all_submissions.length} submissions recorded:\n`
    + all_submissions.map((b) => `*${b.problem_name}* on ${b.year}/${b.month}/${b.day} with `
      + `submission id _${b.submission_id}_;`).join('\n')
    + `\nAnd about study entries:\n`
    + all_studies.map((b) => `*${b.content}* on ${b.year}/${b.month}/${b.day}`).join('\n')
    + `\nAnd about problem set entries:\n`
    + all_problem_sets.map((b) => `*${b.content}* on ${b.year}/${b.month}/${b.day}`).join('\n'), { parse_mode: "Markdown" });
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