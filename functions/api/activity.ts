import { getSessionUser } from '../utils/auth';

export const onRequestGet: PagesFunction<{ PLANNER_KV: KVNamespace }> = async (context) => {
  const user = await getSessionUser(context.request, context.env.PLANNER_KV);
  if (!user) {
    return new Response(JSON.stringify({ error: 'عدم احراز هویت' }), { status: 401 });
  }

  const activityStr = await context.env.PLANNER_KV.get(`activity:${user.username}`);
  const activityMap = activityStr ? JSON.parse(activityStr) : {};

  return new Response(JSON.stringify({ success: true, data: activityMap }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
