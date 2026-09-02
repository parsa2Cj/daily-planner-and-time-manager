function escapeHtml(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export const onRequestPost: PagesFunction<{ PLANNER_KV: KVNamespace, TELEGRAM_BOT_TOKEN: string }> = async (context) => {
  try {
    const body = await context.request.json() as any;
    
    if (body.message && body.message.from && body.message.text) {
      const telegramUsername = body.message.from.username;
      const chatId = body.message.chat.id;
      const text = body.message.text.trim();
      const token = context.env.TELEGRAM_BOT_TOKEN;

      if (!token) {
        return new Response('No bot token configured', { status: 500 });
      }

      if (!telegramUsername) {
        await sendTelegramMessage(token, chatId, "⚠️ شما نام کاربری (Username) در تلگرام ندارید. لطفاً ابتدا در تنظیمات تلگرام خود یک نام کاربری تنظیم کنید و آن را به ادمین اعلام کنید.");
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
          await sendTelegramMessage(
            token,
            chatId,
            `🎉 سلام <b>${escapeHtml(matchedUserData.username)}</b> عزیز!\n\nاکانت تلگرام شما با موفقیت به سیستم برنامه‌ریزی متصل شد.\nاز این پس، یادآوری برنامه‌ها (۱۰ دقیقه قبل از شروع) و امکان مشاهده وضعیت روزانه از طریق این بات برای شما ارسال خواهد شد.`,
            true
          );
        } else {
          await sendTelegramMessage(
            token,
            chatId,
            `❌ آیدی تلگرام شما (<code>@${escapeHtml(telegramUsername)}</code>) در سیستم ثبت نشده است.\nلطفاً ابتدا از ادمین یا در بخش تنظیمات کاربری بخواهید آیدی شما را اضافه کند.`
          );
        }
      } else if (text === '📅 برنامه‌های امروز' || text === '/events' || text === '/today') {
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

          if (data.events && data.events.length > 0) {
            let msg = `📅 <b>برنامه‌ریزی زمانی امروز (${todayStr}):</b>\n\n`;
            data.events.forEach((ev: any) => {
              msg += `🔹 <b>${escapeHtml(ev.startTime)} تا ${escapeHtml(ev.endTime)}</b> — <b>${escapeHtml(ev.title)}</b>\n`;
              
              if (ev.checklist && Array.isArray(ev.checklist) && ev.checklist.length > 0) {
                const doneCount = ev.checklist.filter((c: any) => c.completed).length;
                msg += `   <i>📋 زیرکارها (${doneCount}/${ev.checklist.length}):</i>\n`;
                ev.checklist.forEach((item: any) => {
                  if (item.completed) {
                    msg += `      ✅ <s>${escapeHtml(item.text)}</s> <i>(انجام شده)</i>\n`;
                  } else {
                    msg += `      ◻️ ${escapeHtml(item.text)}\n`;
                  }
                });
              }
              msg += `\n`;
            });
            await sendTelegramMessage(token, chatId, msg, true);
          } else {
            await sendTelegramMessage(token, chatId, "ℹ️ شما برای امروز هیچ برنامه‌ای در بخش زمان‌بندی تنظیم نکرده‌اید.", true);
          }
        } else {
          await sendTelegramMessage(token, chatId, "⚠️ حساب شما به سیستم متصل نشده است. لطفاً ابتدا دستور /start را ارسال کنید.", false);
        }
      } else if (text === '✅ وظایف امروز' || text === '/tasks') {
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

          if (data.tasks && data.tasks.length > 0) {
            const completedCount = data.tasks.filter((t: any) => t.completed).length;
            let msg = `✅ <b>لیست کارها و وظایف امروز (${todayStr}):</b>\n`;
            msg += `<i>📊 وضعیت: ${completedCount} از ${data.tasks.length} تسک انجام شده است.</i>\n\n`;

            const priorityMap: any = {
              high: '🔴 فوری',
              medium: '🟡 متوسط',
              low: '🟢 عادی'
            };

            data.tasks.forEach((t: any) => {
              const priorityText = priorityMap[t.priority] || '';
              if (t.completed) {
                msg += `✅ <s>${escapeHtml(t.title)}</s> <i>(انجام شده)</i>\n`;
              } else {
                msg += `⏳ <b>${escapeHtml(t.title)}</b> ${priorityText ? `[${priorityText}]` : ''}\n`;
              }
            });
            await sendTelegramMessage(token, chatId, msg, true);
          } else {
            await sendTelegramMessage(token, chatId, "ℹ️ شما برای امروز هیچ وظیفه‌ای در لیست تسک‌ها ثبت نکرده‌اید.", true);
          }
        } else {
          await sendTelegramMessage(token, chatId, "⚠️ حساب شما به سیستم متصل نشده است. لطفاً ابتدا دستور /start را ارسال کنید.", false);
        }
      } else if (text === '📊 خلاصه و وضعیت امروز' || text === '/status') {
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

          const totalTasks = data.tasks ? data.tasks.length : 0;
          const doneTasks = data.tasks ? data.tasks.filter((t: any) => t.completed).length : 0;
          const totalEvents = data.events ? data.events.length : 0;
          let totalSubtasks = 0;
          let doneSubtasks = 0;
          if (data.events) {
            data.events.forEach((e: any) => {
              if (e.checklist) {
                totalSubtasks += e.checklist.length;
                doneSubtasks += e.checklist.filter((c: any) => c.completed).length;
              }
            });
          }

          let msg = `📊 <b>گزارش عملکرد امروز شما (${todayStr}):</b>\n\n`;
          msg += `🎯 <b>کارهای انجام شده:</b> ${doneTasks} از ${totalTasks}\n`;
          msg += `📅 <b>رویدادهای زمانی:</b> ${totalEvents} برنامه در جدول زمان‌بندی\n`;
          if (totalSubtasks > 0) {
            msg += `📋 <b>زیرکارهای چک‌لیست:</b> ${doneSubtasks} از ${totalSubtasks} تیک خورده\n`;
          }
          if (data.focusSessionsCount) {
            msg += `⏱ <b>جلسات پومودورو:</b> ${data.focusSessionsCount} پارت تمرکز\n`;
          }
          await sendTelegramMessage(token, chatId, msg, true);
        } else {
          await sendTelegramMessage(token, chatId, "⚠️ حساب شما به سیستم متصل نشده است. لطفاً ابتدا دستور /start را ارسال کنید.", false);
        }
      } else {
        // Default fallback
        await sendTelegramMessage(token, chatId, "🤖 برای مشاهده برنامه‌ها و وظایف، لطفاً از دکمه‌های زیر استفاده کنید:", true);
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
    parse_mode: 'HTML'
  };

  if (useKeyboard) {
    payload.reply_markup = {
      keyboard: [
        [{ text: '📅 برنامه‌های امروز' }, { text: '✅ وظایف امروز' }],
        [{ text: '📊 خلاصه و وضعیت امروز' }]
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
