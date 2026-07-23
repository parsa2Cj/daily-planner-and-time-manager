import { getSessionUser } from '../../utils/auth';

export const onRequestPost: PagesFunction<{ PLANNER_KV: KVNamespace, TELEGRAM_BOT_TOKEN: string }> = async (context) => {
  const user = await getSessionUser(context.request, context.env.PLANNER_KV);
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'عدم دسترسی' }), { status: 403 });
  }

  const token = context.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ error: 'توکن ربات تلگرام در تنظیمات کلودفلر (TELEGRAM_BOT_TOKEN) یافت نشد. لطفا ابتدا آن را اضافه کنید.' }), { status: 400 });
  }

  // Generate the webhook URL using the current request's origin
  const origin = new URL(context.request.url).origin;
  const webhookUrl = `${origin}/api/bot/webhook`;

  const tgUrl = `https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`;
  
  try {
    const res = await fetch(tgUrl);
    const data = await res.json();
    
    if (data.ok) {
      return new Response(JSON.stringify({ success: true, message: 'ربات با موفقیت به سایت متصل شد!' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: 'خطا از سمت تلگرام: ' + data.description }), { status: 400 });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: 'خطا در ارتباط با سرور تلگرام' }), { status: 500 });
  }
};
