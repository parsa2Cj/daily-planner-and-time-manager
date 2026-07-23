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
          await sendTelegramMessage(token, chatId, `سلام ${matchedUserData.username}! اکانت تلگرام شما با موفقیت به سیستم متصل شد. از این پس برنامه‌ها به اینجا ارسال می‌شوند.`, true);
        } else {
          await sendTelegramMessage(token, chatId, "آیدی تلگرام شما در سیستم ثبت نشده است. لطفا ابتدا آیدی خود را به ادمین بدهید.");
        }
      } else if (text === '📅 برنامه‌های امروز' || text === '✅ وظایف امروز') {
        // Find user by chatId
        const { keys } = await context.env.PLANNER_KV.list({ prefix: 'user:' });
        let matchedUsername = null;
        for (const k of keys) {
          const uStr = await context.env.PLANNER_KV.get(k.name);
          if (uStr) {
            const u = JSON.parse(uStr);
            if (u.chatId === chatId) {
              matchedUsername = u.username;
              break;
            }
          }
        }

        if (matchedUsername) {
          const now = new Date();
          const tehranFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit'
          });
          const parts = tehranFormatter.formatToParts(now);
          const dateMap: any = {};
          for (const part of parts) {
            dateMap[part.type] = part.value;
          }
          const todayStr = `${dateMap.year}-${dateMap.month}-${dateMap.day}`;

          const dataStr = await context.env.PLANNER_KV.get(`data:${matchedUsername}:${todayStr}`);
          const data = dataStr ? JSON.parse(dataStr) : {};

          if (text === '📅 برنامه‌های امروز') {
            if (data.events && data.events.length > 0) {
              let msg = `📅 **برنامه‌های امروز شما (${todayStr}):**\n\n`;
              data.events.forEach((ev: any) => {
                msg += `🔹 ${ev.startTime} تا ${ev.endTime} - ${ev.title}\n`;
              });
              await sendTelegramMessage(token, chatId, msg, true);
            } else {
              await sendTelegramMessage(token, chatId, "شما برای امروز هیچ برنامه‌ای تنظیم نکرده‌اید.", true);
            }
          } else if (text === '✅ وظایف امروز') {
            if (data.tasks && data.tasks.length > 0) {
              let msg = `✅ **وظایف امروز شما (${todayStr}):**\n\n`;
              data.tasks.forEach((t: any) => {
                msg += `${t.completed ? '✅' : '⏳'} ${t.title}\n`;
              });
              await sendTelegramMessage(token, chatId, msg, true);
            } else {
              await sendTelegramMessage(token, chatId, "شما برای امروز هیچ وظیفه‌ای تنظیم نکرده‌اید.", true);
            }
          }
        } else {
          await sendTelegramMessage(token, chatId, "شما هنوز به سیستم متصل نشده‌اید. لطفا /start را بفرستید.", false);
        }
      } else {
         // Default fallback
         await sendTelegramMessage(token, chatId, "لطفاً از دکمه‌های زیر استفاده کنید:", true);
      }
    }

    return new Response('OK');
  } catch (err) {
    console.error(err);
    return new Response('Error', { status: 500 });
  }
};

async function sendTelegramMessage(token: string, chatId: number, text: string, useKeyboard: boolean = false) {
  const payload: any = {
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown'
  };

  if (useKeyboard) {
    payload.reply_markup = {
      keyboard: [
        [{ text: '📅 برنامه‌های امروز' }, { text: '✅ وظایف امروز' }]
      ],
      resize_keyboard: true
    };
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}
