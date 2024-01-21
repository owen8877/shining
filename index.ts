import TelegramBot from 'node-telegram-bot-api';
import type { Message } from 'node-telegram-bot-api';

import { PrismaClient } from '@prisma/client'

import { insert_if_no_duplicate, parse_link } from './lib/leetcode';

const prisma = new PrismaClient();

const token = process.env.TELEGRAM_BOT_TOKEN || 'default_token';
const bot = new TelegramBot(token, { polling: true });

console.log('up and running');

bot.onText(/\/start/, async (msg: Message) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hello! I am your event-tracking bot.');
});

// handles leetcode submission links
bot.onText(/leetcode\.com/, async (msg: Message) => {
  const chatId = msg.chat.id;
  const b = parse_link(msg.text ?? '');
  try {
    const no_duplicate = await insert_if_no_duplicate(prisma, b);
    if (no_duplicate) {
      const reply = `Thanks for the submission, `
        + `You did *${b.problem_name}* on ${b.year}/${b.month}/${b.day} with `
        + `submission id _${b.submission_id}_,`;
      await bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });
    } else {
      await bot.sendMessage(chatId, 'Oops! Looks like we have added this submission before.')
    }
  } catch (e) {
    await bot.sendMessage(chatId, `You seem to pass a link to the leetcode website, but the following error occurred when I tried to parse this message:\n\n${e}\n\nPlease let Owen know about this.`)
  }
});

bot.onText(/\/stat/, async (msg: Message) => {
  const all_submissions = await prisma.leetcodeSubmission.findMany()

  await bot.sendMessage(msg.chat.id, `You have ${all_submissions.length} submissions recorded:\n`
    + all_submissions.map((b) => `*${b.problem_name}* on ${b.year}/${b.month}/${b.day} with `
      + `submission id _${b.submission_id}_;`).join('\n'), { parse_mode: "Markdown" })
});

bot.onText(/\/drop_everything/, async (msg: Message) => {
  const send = await bot.sendMessage(msg.chat.id, `Are you sure to drop all data?`);
  await bot.onReplyToMessage(send.chat.id, send.message_id, async (reply_msg: Message) => {
    if (reply_msg.text === 'yes') {
      await prisma.leetcodeSubmission.deleteMany({});
      await bot.sendMessage(reply_msg.chat.id, 'All cleaned up!');
    } else {
      await bot.sendMessage(reply_msg.chat.id, 'Phew scared the sh\*t out of me.');
    }
  })
});