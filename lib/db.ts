import { createClient } from 'redis';

const client = createClient({ url: `${process.env.db}` });

client.connect().then(() => {
  console.log('Redis connected');
});

client.on('error', (err) => console.log('[Redis] Redis Error', err));

interface Data {
  userID: number,
  role: string,
  content: string
}

export default {
  regUser: async (data:number) => {
    if (await client.exists(`user-${data}`)) {
      return;
    }
    await client.HSET(`user-${data}`, 'context', JSON.stringify({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [],
    }));
  },

  setContext: async (data:Data) => {
    try {
      const req = JSON.parse((await client.HGETALL(`user-${data.userID}`)).context);
      if (req.messages.length >= 10) {
        req.messages.shift();
      }
      req.messages.push({ role: data.role, content: data.content });
      await client.hSet(`user-${data.userID}`, 'context', JSON.stringify(req));
    } catch (error) {
      console.log(error);
    }
  },

  getContext: async (data: number) => JSON.parse((await client.HGETALL(`user-${data}`)).context),

  setField: async (data: { userID: number, key: string, value: any }) => {
    await client.HSET(`user-${data.userID}`, data.key, data.value);
  },

  getField: async (data: number, key: any) => {
    const field = await client.HGETALL(`user-${data}`);
    return field[key];
  },
};
