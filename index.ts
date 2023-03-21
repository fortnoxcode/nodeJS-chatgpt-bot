import * as grammy from 'grammy';

import commands from './bot/command/index.js';

const bot = new grammy.Bot(`${process.env.BOT_TOKEN}`);

commands.Start(bot);
commands.Message(bot);

bot.start({
  onStart(botInfo) {
    console.log(`Bot ${botInfo.username} started`);
  },
});
