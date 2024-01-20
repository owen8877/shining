import TelegramBot from 'node-telegram-bot-api';
import type { Message } from 'node-telegram-bot-api';

import { PrismaClient } from '@prisma/client'

import { parse_link } from './lib/leetcode';

const prisma = new PrismaClient();

const token = process.env.TELEGRAM_BOT_TOKEN || 'default_token';
const bot = new TelegramBot(token, { polling: true });

console.log('up and running');

bot.onText(/\/start/, (msg: Message) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hello! I am your event-tracking bot.');
});

// handles leetcode submission links
bot.onText(/leetcode\.com/, (msg: Message) => {
  const chatId = msg.chat.id;
  const { problem_name, submission_id, year, month, day } = parse_link(msg.text ?? '');
  bot.sendMessage(chatId, `Thanks for the submission! You did *${problem_name}* on ${year}/${month}/${day} with submission id _${submission_id}_!`);


})

// bot.onText(/\/stat/, async (msg: Message) => {
//   bot.sendMessage(msg.chat.id, `received!`)
//   await prisma.leetcodeSubmission.create({
//     data: {
//       problem_name: 'aa',
//       submission_id: 123,
//       year: 2023,
//       month: 12,
//       day: 13,
//     }
//   })

//   const all_submissions = await prisma.leetcodeSubmission.findMany()
//   console.dir(all_submissions, { depth: null })

//   bot.sendMessage(msg.chat.id, `${all_submissions}`)
// })