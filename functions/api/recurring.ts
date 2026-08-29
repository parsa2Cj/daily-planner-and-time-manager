import { getSessionUser } from '../utils/auth';

export const onRequestGet: PagesFunction<{ PLANNER_KV: KVNamespace }> = async (context) => {
  const user = await getSessionUser(context.request, context.env.PLANNER_KV);
  if (!user) {
    return new Response(JSON.stringify({ error: 'عدم احراز هویت' }), { status: 401 });
  }

  const dataStr = await context.env.PLANNER_KV.get(`recurring:${user.username}`);
  const data = dataStr ? JSON.parse(dataStr) : [];

  return new Response(JSON.stringify({ success: true, data }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const onRequestPost: PagesFunction<{ PLANNER_KV: KVNamespace }> = async (context) => {
  const user = await getSessionUser(context.request, context.env.PLANNER_KV);
  if (!user) {
    return new Response(JSON.stringify({ error: 'عدم احراز هویت' }), { status: 401 });
  }

  try {
    const newData = await context.request.json();
    await context.env.PLANNER_KV.put(`recurring:${user.username}`, JSON.stringify(newData));

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'داده نامعتبر' }), { status: 400 });
  }
};
