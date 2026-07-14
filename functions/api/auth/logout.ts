export const onRequestPost: PagesFunction<{ PLANNER_KV: KVNamespace }> = async (context) => {
  const { request, env } = context;
  const cookieHeader = request.headers.get('Cookie');
  
  if (cookieHeader) {
    const match = cookieHeader.match(/session=([^;]+)/);
    if (match) {
      const token = match[1];
      await env.PLANNER_KV.delete(`session:${token}`);
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Set-Cookie': `session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`,
      'Content-Type': 'application/json'
    }
  });
};
