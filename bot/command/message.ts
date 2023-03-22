import { ChatGPT } from 'chatgpt-wrapper';
import db from '../../lib/db.js';

const chat = new ChatGPT({
  API_KEY: `${process.env.ChatGPT_API_KEY}`,
});

export default (bot) => {
  bot.on('message', async (ctx) => {
    if (!ctx.message.text) {
      ctx.reply("I don't know how to work with something that isn't text!");
      return;
    }

    if (await db.getField(ctx.from.id, 'pending') === '1') {
      const warningMessage = await bot.api.sendMessage(ctx.from.id, 'Wait, the previous request has not been processed yet!');
      bot.api.sendChatAction(ctx.chat.id, 'typing').catch((e) => {
        console.log(e);
      });
      setTimeout(async () => {
        await bot.api.deleteMessage(ctx.chat.id, warningMessage.message_id);
        await bot.api.deleteMessage(ctx.chat.id, ctx.message.message_id);
      }, 3000);
      return;
    }

    const msg = await ctx.reply('Generating a response...');

    bot.api.sendChatAction(ctx.chat.id, 'typing').catch((e) => { console.log(e); });
    await db.setContext({
      userID: ctx.from.id,
      role: 'user',
      content: ctx.message.text,
    });

    const stream = await chat.stream(await db.getContext(ctx.from.id));

    await db.setField({ userID: ctx.from.id, key: 'pending', value: 1 });

    let answer = '';
    const edit = setInterval(async () => {
      try {
        await ctx.api.editMessageText(ctx.chat.id, msg.message_id, answer);
      } catch (error) {
        clearInterval(edit);
      }
    }, 1000);

    stream.on('data', async (data) => {
      try {
        const res = data.toString().match(/data: (.*)/g);

        if (res.indexOf('data: [DONE]') !== -1) {
          return;
        }
        res.forEach((element) => {
          answer += JSON.parse(element.replace('data: ', '')).choices[0].delta.content || '';
        });
      } catch (error) {
        console.log(error);
        await db.setField({ userID: ctx.from.id, key: 'pending', value: 0 });
      }
    });

    stream.on('end', async () => {
      try {
        await db.setContext({
          userID: ctx.from.id,
          role: 'assistant',
          content: answer,
        });
        await db.setField({
          userID: ctx.from.id,
          key: 'pending',
          value: '0',
        });

        const endMessage = await bot.api.sendMessage(ctx.chat.id, 'Generation completed!');

        setTimeout(async () => {
          await bot.api.deleteMessage(ctx.chat.id, endMessage.message_id);
        }, 2000);
      } catch (error) {
        await db.setField({ userID: ctx.from.id, key: 'pending', value: 0 });
        console.log(error);
      }
    });
  });
};
