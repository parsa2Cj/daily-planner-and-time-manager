function escapeHtml(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export const onRequestGet: PagesFunction<{ PLANNER_KV: KVNamespace, TELEGRAM_BOT_TOKEN: string, CRON_SECRET: string }> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const secret = url.searchParams.get('secret');
    const force = url.searchParams.get('force') === '1';

    // Only allow execution if secret matches the CRON_SECRET env variable
    if (context.env.CRON_SECRET && secret !== context.env.CRON_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = context.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return new Response('No bot token configured', { status: 500 });
    }

    // Get current time in Tehran timezone
    const now = new Date();
    const tehranFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const parts = tehranFormatter.formatToParts(now);
    const dateMap: any = {};
    for (const part of parts) {
      dateMap[part.type] = part.value;
    }
    
    const todayStr = `${dateMap.year}-${dateMap.month}-${dateMap.day}`;
    let curHour = parseInt(dateMap.hour, 10);
    if (curHour === 24) curHour = 0;
    const curMin = parseInt(dateMap.minute, 10);
    const currentTotalMinutes = curHour * 60 + curMin;

    // Get all users
    const { keys } = await context.env.PLANNER_KV.list({ prefix: 'user:' });
    
    let remindersSent = 0;
    const logDetails: any[] = [];

    for (const k of keys) {
      const uStr = await context.env.PLANNER_KV.get(k.name);
      if (!uStr) continue;
      const u = JSON.parse(uStr);
      
      // If user has a chatId, check their schedule
      if (u.chatId) {
        const username = u.username;
        const dataStr = await context.env.PLANNER_KV.get(`data:${username}:${todayStr}`);
        
        if (dataStr) {
          const data = JSON.parse(dataStr);
          if (data.events && Array.isArray(data.events)) {
            for (const ev of data.events) {
              if (!ev.startTime || !ev.title) continue;

              const [startHStr, startMStr] = ev.startTime.split(':');
              const evStartHour = parseInt(startHStr, 10);
              const evStartMin = parseInt(startMStr || '0', 10);
              const evStartTotalMinutes = evStartHour * 60 + evStartMin;

              // Difference in minutes between event start and current time
              const diffMinutes = evStartTotalMinutes - currentTotalMinutes;

              // Check if event starts in ~10 minutes (window: 0 to 15 minutes before start)
              if (diffMinutes >= 0 && diffMinutes <= 15) {
                const reminderKey = `reminder:${username}:${todayStr}:${ev.id || (ev.startTime + '_' + ev.title)}`;
                const alreadySent = await context.env.PLANNER_KV.get(reminderKey);

                if (!alreadySent || force) {
                  let messageText = `⏰ <b>یادآوری شروع برنامه (۱۰ دقیقه قبل):</b>\n\n`;
                  messageText += `📌 <b>عنوان برنامه:</b> ${escapeHtml(ev.title)}\n`;
                  messageText += `🕒 <b>زمان اجرا:</b> ${escapeHtml(ev.startTime)} تا ${escapeHtml(ev.endTime)}`;
                  
                  if (diffMinutes === 0) {
                    messageText += ` <i>(هم‌اکنون)</i>\n`;
                  } else {
                    messageText += ` <i>(حدود ${diffMinutes} دقیقه دیگر)</i>\n`;
                  }

                  // Subtasks / Checklist
                  if (ev.checklist && Array.isArray(ev.checklist) && ev.checklist.length > 0) {
                    const doneCount = ev.checklist.filter((c: any) => c.completed).length;
                    messageText += `\n📋 <b>چک‌لیست زیرکارها (${doneCount}/${ev.checklist.length}):</b>\n`;
                    ev.checklist.forEach((item: any) => {
                      if (item.completed) {
                        messageText += `   ✅ <s>${escapeHtml(item.text)}</s> <i>(انجام شده)</i>\n`;
                      } else {
                        messageText += `   ◻️ ${escapeHtml(item.text)}\n`;
                      }
                    });
                  }

                  messageText += `\n🎯 <i>موفق باشید! لطفاً پس از انجام زیرکارها، در سایت آن‌ها را تیک بزنید.</i>`;

                  await sendTelegramMessage(token, u.chatId, messageText);
                  await context.env.PLANNER_KV.put(reminderKey, '1', { expirationTtl: 86400 });
                  remindersSent++;
                  logDetails.push({ user: username, event: ev.title, diff: diffMinutes });
                }
              }
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      remindersSent, 
      date: todayStr, 
      tehranTime: `${String(curHour).padStart(2, '0')}:${String(curMin).padStart(2, '0')}`,
      logDetails 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err?.message || 'Server error' }), { status: 500 });
  }
};

async function sendTelegramMessage(token: string, chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    })
  });
}
