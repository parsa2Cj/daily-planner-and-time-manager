export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function generateToken(): string {
  return crypto.randomUUID();
}

export async function getSessionUser(request: Request, kv: KVNamespace): Promise<any> {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  
  const match = cookieHeader.match(/session=([^;]+)/);
  if (!match) return null;
  
  const token = match[1];
  const username = await kv.get(`session:${token}`);
  if (!username) return null;
  
  const userStr = await kv.get(`user:${username}`);
  if (!userStr) return null;
  
  return JSON.parse(userStr);
}
