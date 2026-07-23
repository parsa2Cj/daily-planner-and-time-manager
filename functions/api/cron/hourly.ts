export const onRequestGet: PagesFunction<{ PLANNER_KV: KVNamespace, TELEGRAM_BOT_TOKEN: string, CRON_SECRET: string }> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const secret = url.searchParams.get('secret');

    // Only allow execution if secret matches the CRON_SECRET env variable
    // If CRON_SECRET is not set, we'll allow it for now, but it's not secure.
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
      hour12: false
    });
    
    // Format parts: array of { type: 'year', value: '2023' }, etc.
    const parts = tehranFormatter.formatToParts(now);
    const dateMap: any = {};
    for (const part of parts) {
      dateMap[part.type] = part.value;
    }
    
    // Format to YYYY-MM-DD
    const todayStr = `${dateMap.year}-${dateMap.month}-${dateMap.day}`;
    const currentHourStr = dateMap.hour; // "09", "14", etc.

    // Get all users
    const { keys } = await context.env.PLANNER_KV.list({ prefix: 'user:' });
    
    let messagesSent = 0;

    for (const k of keys) {
      const uStr = await context.env.PLANNER_KV.get(k.name);
      if (!uStr) continue;
      const u = JSON.parse(uStr);
      
      // If user has a chatId, we check their schedule
      if (u.chatId) {
        const username = u.username;
        const dataStr = await context.env.PLANNER_KV.get(`data:${username}:${todayStr}`);
        
        if (dataStr) {
          const data = JSON.parse(dataStr);
          if (data.events && Array.isArray(data.events)) {
            // Find events for the current hour
            const hourEvents = data.events.filter((ev: any) => {
              if (ev.startTime) {
                const eventHour = ev.startTime.split(':')[0];
                return eventHour === currentHourStr;
              }
              return false;
            });

            if (hourEvents.length > 0) {
              // Send message to this user
              let messageText = `📅 **برنامه‌های ساعت ${currentHourStr}**\n\n`;
              hourEvents.forEach((ev: any) => {
                messageText += `🔹 ${ev.startTime} تا ${ev.endTime} - ${ev.title}\n`;
              });
              
              await sendTelegramMessage(token, u.chatId, messageText);
              messagesSent++;
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, messagesSent, date: todayStr, hour: currentHourStr }), {
      headers: { 'Content-Type': 'application/json' }
    });

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
      text: text,
      parse_mode: 'Markdown'
    })
  });
}
