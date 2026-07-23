export const onRequestPost: PagesFunction<{ PLANNER_KV: KVNamespace, TELEGRAM_BOT_TOKEN: string }> = async (context) => {
  try {
    const body = await context.request.json() as any;
    
    if (body.message && body.message.from && body.message.text) {
      const telegramUsername = body.message.from.username;
      const chatId = body.message.chat.id;
      const text = body.message.text;
      const token = context.env.TELEGRAM_BOT_TOKEN;

      if (!token) {
        return new Response('No bot token configured', { status: 500 });
      }

      if (!telegramUsername) {
        await sendTelegramMessage(token, chatId, "شما نام کاربری (Username) تلگرام ندارید. لطفا ابتدا یک آیدی برای اکانت خود تنظیم کنید.");
        return new Response('OK');
      }

      if (text === '/start') {
        const { keys } = await context.env.PLANNER_KV.list({ prefix: 'user:' });
        let matchedUserKey = null;
        let matchedUserData = null;
        
        for (const k of keys) {
          const uStr = await context.env.PLANNER_KV.get(k.name);
          if (uStr) {
            const u = JSON.parse(uStr);
            if (u.telegramUsername && u.telegramUsername.toLowerCase() === telegramUsername.toLowerCase()) {
              matchedUserKey = k.name;
              matchedUserData = u;
              break;
            }
          }
        }

        if (matchedUserKey && matchedUserData) {
          matchedUserData.chatId = chatId;
          await context.env.PLANNER_KV.put(matchedUserKey, JSON.stringify(matchedUserData));
          await sendTelegramMessage(token, chatId, `سلام ${matchedUserData.username}! اکانت تلگرام شما با موفقیت به سیستم متصل شد. از این پس برنامه‌ها به اینجا ارسال می‌شوند.`);
        } else {
          await sendTelegramMessage(token, chatId, "آیدی تلگرام شما در سیستم ثبت نشده است. لطفا ابتدا آیدی خود را به ادمین بدهید.");
        }
      }
    }

    return new Response('OK');
  } catch (err) {
    console.error(err);
    return new Response('Error', { status: 500 });
  }
};

async function sendTelegramMessage(token: string, chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text
    })
  });
}
