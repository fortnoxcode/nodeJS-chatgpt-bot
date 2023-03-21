import db from '../../lib/db.js';

export default (bot) => {
  bot.command('start', async (ctx) => {
    await db.regUser(ctx.from.id);
    await ctx.reply('Напиши мне что-нибудь');
  });
};
