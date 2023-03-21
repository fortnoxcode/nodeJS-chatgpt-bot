import { ChatGPT } from 'chatgpt-wrapper';
import db from '../../lib/db.js';

const chat = new ChatGPT({
  API_KEY: `${process.env.ChatGPT_API_KEY}`,
});

export default (bot) => {
  bot.on('message', async (ctx) => {
    if (!ctx.message.text) {
      ctx.reply('Я не умею работать с тем, что не является текстом!');
      return;
    }

    if (await db.getField(ctx.from.id, 'pending') === '1') {
      const warningMessage = await bot.api.sendMessage(ctx.from.id, 'Подождите, предыдущий запрос ещё не обработан!');

      bot.api.sendChatAction(ctx.chat.id, 'typing').catch((e) => {console.log(e)});

      setTimeout(async () => {
        await bot.api.deleteMessage(ctx.chat.id, warningMessage.message_id);
        await bot.api.deleteMessage(ctx.chat.id, ctx.message.message_id);
      }, 3000);
      return;
    }

    await db.setField({ userID: ctx.from.id, key: 'pending', value: 1 });

    const msg = await ctx.reply('Генерирую ответ...');

    bot.api.sendChatAction(ctx.chat.id, 'typing').catch((e) => {
      console.log(e);
    });

    await db.setContext({
      userID: ctx.from.id,
      role: 'user',
      content: ctx.message.text,
    });

    const stream = await chat.stream(await db.getContext(ctx.from.id));

    let answer = '';
    const edit = setInterval(async () => {
      try {
        await ctx.api.editMessageText(ctx.chat.id, msg.message_id, answer);
      } catch (error) {
        // console.log(error);
        clearInterval(edit); // тут он сабя вырубает сам
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
      }
    });
    
    stream.on('end', async () => {
      const endMessage = await bot.api.sendMessage(ctx.chat.id, 'Генерация завершена!');

      setTimeout(async () => {
        await bot.api.deleteMessage(ctx.chat.id, endMessage.message_id);
      }, 2000);

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
        console.log(`${ctx.message.from.first_name} (@${ctx.message.from.username})\nprompt: ${ctx.message.text}\nanswer:\n${answer}`);
      } catch (error) {
        console.log(error);
      }
    });
  });
};
