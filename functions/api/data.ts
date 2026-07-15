import { getSessionUser } from '../utils/auth';

export const onRequestGet: PagesFunction<{ PLANNER_KV: KVNamespace }> = async (context) => {
  const user = await getSessionUser(context.request, context.env.PLANNER_KV);
  if (!user) {
    return new Response(JSON.stringify({ error: 'عدم احراز هویت' }), { status: 401 });
  }

  const url = new URL(context.request.url);
  const date = url.searchParams.get('date');
  if (!date) {
    return new Response(JSON.stringify({ error: 'پارامتر تاریخ نامشخص است' }), { status: 400 });
  }

  const dataStr = await context.env.PLANNER_KV.get(`data:${user.username}:${date}`);
  const data = dataStr ? JSON.parse(dataStr) : {
    tasks: [],
    events: [],
    focusSessionsCount: 0,
    dailyLog: { energy: 3, mood: '😐', notes: '' }
  };

  return new Response(JSON.stringify({ success: true, data }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const onRequestPost: PagesFunction<{ PLANNER_KV: KVNamespace }> = async (context) => {
  const user = await getSessionUser(context.request, context.env.PLANNER_KV);
  if (!user) {
    return new Response(JSON.stringify({ error: 'عدم احراز هویت' }), { status: 401 });
  }

  const url = new URL(context.request.url);
  const date = url.searchParams.get('date');
  if (!date) {
    return new Response(JSON.stringify({ error: 'پارامتر تاریخ نامشخص است' }), { status: 400 });
  }

  try {
    const newData = await context.request.json();
    await context.env.PLANNER_KV.put(`data:${user.username}:${date}`, JSON.stringify(newData));

    // Calculate activity level and update activity map
    // Activity score = tasks completed (1 pt) + focus sessions (2 pts)
    let score = 0;
    if (newData.tasks) {
      score += newData.tasks.filter((t: any) => t.completed).length;
    }
    if (newData.focusSessionsCount) {
      score += newData.focusSessionsCount * 2;
    }

    // Fetch existing activity map
    const activityStr = await context.env.PLANNER_KV.get(`activity:${user.username}`);
    const activityMap = activityStr ? JSON.parse(activityStr) : {};
    
    // Only update if score changed or is non-zero
    activityMap[date] = score;
    await context.env.PLANNER_KV.put(`activity:${user.username}`, JSON.stringify(activityMap));

    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'داده نامعتبر' }), { status: 400 });
  }
};
