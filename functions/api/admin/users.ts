import { getSessionUser, hashPassword } from '../../../utils/auth';

export const onRequestGet: PagesFunction<{ PLANNER_KV: KVNamespace }> = async (context) => {
  const user = await getSessionUser(context.request, context.env.PLANNER_KV);
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'عدم دسترسی' }), { status: 403 });
  }

  const { keys } = await context.env.PLANNER_KV.list({ prefix: 'user:' });
  const users = await Promise.all(
    keys.map(async (k) => {
      const uStr = await context.env.PLANNER_KV.get(k.name);
      if (uStr) {
        const u = JSON.parse(uStr);
        return { username: u.username, role: u.role };
      }
      return null;
    })
  );

  return new Response(JSON.stringify({ success: true, users: users.filter(Boolean) }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const onRequestPost: PagesFunction<{ PLANNER_KV: KVNamespace }> = async (context) => {
  const user = await getSessionUser(context.request, context.env.PLANNER_KV);
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'عدم دسترسی' }), { status: 403 });
  }

  try {
    const { username, password, role = 'user' } = await context.request.json() as any;
    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'اطلاعات ناقص است' }), { status: 400 });
    }

    const existing = await context.env.PLANNER_KV.get(`user:${username}`);
    if (existing) {
      return new Response(JSON.stringify({ error: 'این نام کاربری از قبل وجود دارد' }), { status: 400 });
    }

    const hashed = await hashPassword(password);
    await context.env.PLANNER_KV.put(`user:${username}`, JSON.stringify({ username, passwordHash: hashed, role }));

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'خطای سرور' }), { status: 500 });
  }
};

export const onRequestDelete: PagesFunction<{ PLANNER_KV: KVNamespace }> = async (context) => {
  const user = await getSessionUser(context.request, context.env.PLANNER_KV);
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'عدم دسترسی' }), { status: 403 });
  }

  try {
    const { username } = await context.request.json() as any;
    if (username === 'admin') {
       return new Response(JSON.stringify({ error: 'نمی‌توانید ادمین اصلی را حذف کنید' }), { status: 400 });
    }
    await context.env.PLANNER_KV.delete(`user:${username}`);
    await context.env.PLANNER_KV.delete(`data:${username}`); // clear data too
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'خطای سرور' }), { status: 500 });
  }
};
