import * as grammy from 'grammy';

import { Start, Message } from './bot/command/index.js';

const bot = new grammy.Bot(`${process.env.BOT_TOKEN}`);

Start(bot);
Message(bot);

bot.start({
  onStart(botInfo) {
    console.log(`Bot ${botInfo.username} started`);
  },
});
