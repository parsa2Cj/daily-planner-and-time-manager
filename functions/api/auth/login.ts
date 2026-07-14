import { hashPassword, generateToken } from '../../utils/auth';

export const onRequestPost: PagesFunction<{ PLANNER_KV: KVNamespace }> = async (context) => {
  try {
    const { request, env } = context;
    const { username, password } = await request.json() as any;

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'نام کاربری و رمز عبور الزامی است' }), { status: 400 });
    }

    const userStr = await env.PLANNER_KV.get(`user:${username}`);
    
    // If no user exists, and username is admin, let's create the default admin (First run setup)
    if (!userStr && username === 'admin') {
      const hashed = await hashPassword(password);
      await env.PLANNER_KV.put(`user:admin`, JSON.stringify({ username: 'admin', passwordHash: hashed, role: 'admin' }));
      
      const token = generateToken();
      await env.PLANNER_KV.put(`session:${token}`, 'admin', { expirationTtl: 60 * 60 * 24 * 7 }); // 7 days
      
      return new Response(JSON.stringify({ success: true, user: { username: 'admin', role: 'admin' } }), {
        headers: {
          'Set-Cookie': `session=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`,
          'Content-Type': 'application/json'
        }
      });
    }

    if (!userStr) {
      return new Response(JSON.stringify({ error: 'نام کاربری یا رمز عبور اشتباه است' }), { status: 401 });
    }

    const user = JSON.parse(userStr);
    const hashedAttempt = await hashPassword(password);

    if (user.passwordHash !== hashedAttempt) {
      return new Response(JSON.stringify({ error: 'نام کاربری یا رمز عبور اشتباه است' }), { status: 401 });
    }

    const token = generateToken();
    await env.PLANNER_KV.put(`session:${token}`, username, { expirationTtl: 60 * 60 * 24 * 7 });

    return new Response(JSON.stringify({ success: true, user: { username: user.username, role: user.role } }), {
      headers: {
        'Set-Cookie': `session=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'خطای سرور' }), { status: 500 });
  }
};
