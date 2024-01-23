import type { Message } from "node-telegram-bot-api";
import type TelegramBot from "node-telegram-bot-api";

export class Stream {
  bot: TelegramBot;
  chat_id: number;
  buffer: string[];

  constructor(bot: TelegramBot, msg: Message) {
    this.bot = bot;
    this.chat_id = msg.chat.id;
    this.buffer = [];
  }

  append(segment: string) {
    this.buffer.push(segment);
  }

  async fire(options?: TelegramBot.SendMessageOptions) {
    await this.bot.sendMessage(this.chat_id, this.buffer.join('\n'), { parse_mode: 'Markdown', ...options });
  }
}